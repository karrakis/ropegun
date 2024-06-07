import React, { useState, useEffect } from "react";
import classNames from "classnames";
import GraphSwitcher from "../Weather/GraphSwitcher";
import Distance from "../Distance/Distance";
import LocationsSelector from "./Locations/Selector";
import MapControl from "../Map/MapControl";
import Select from "react-select";

import { csrfToken } from "../../utilities/csrfToken";

interface localUser {
  id: number;
  name: string;
  email: string;
  friendships: any[];
}

interface userSavedLocations {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  office: string;
  office_x: number;
  office_y: number;
}

interface tripSavedLocations {
  id: number;
  name: string;
  location: { lat: number; lng: number };
  office: string;
  office_x: number;
  office_y: number;
}

interface TripPlanProps {
  localUser: localUser;
  userSavedLocations: userSavedLocations[];
  tripSavedLocations?: tripSavedLocations[];
}

interface location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  office: string;
  office_x: number;
  office_y: number;
}

interface trips {
  id: number;
  name: string;
  locations: location[];
}

interface parsedLocation {
  name: string;
  location: { lat: number; lng: number };
}

interface trip {
  id?: number;
  name: string;
  locations: parsedLocation[];
  trip_invitations?: any[];
}

export const TripPlan = ({
  localUser,
  userSavedLocations,
  tripSavedLocations = [],
}: TripPlanProps) => {
  const [trip, _updateTrip] = useState<trip>({
    name: "",
    locations: tripSavedLocations || [],
  });

  //possibly excessive, but ensures that when a trip is selected, it is brought up to date.
  const updateTrip = (trip) => {
    fetch(`/api/v1/trips/${trip.id}`, {
      method: "GET",
      headers: {
        Accept: "application/ld+json",
      },
    }).then((response) => {
      response.json().then((data) => {
        console.log("data:", data);
        _updateTrip({
          id: data.id,
          name: data.name,
          locations: data.locations.map((loc) => {
            return {
              name: loc.name,
              location: { lat: loc.latitude, lng: loc.longitude },
              office_x: loc.office_x,
              office_y: loc.office_y,
              office: loc.office,
            };
          }),
          trip_invitations: data.trip_invitations,
        });
      });
    });
  };

  //disables the save button while saving is in progress to prevent bad user experience.
  const [tripSaving, updateTripSaving] = useState(false);

  //primarily used for the dropdown of existing trips.
  const [trips, updateTrips] = useState<trips[]>([]);

  //weather data for the locations in the trip.
  const [weather, updateWeather] = useState({});

  //toggle for the map control
  const [openMap, updateOpenMap] = useState(false);

  //saved locations for the user.  Deprecated?
  const [savedLocations, updateSavedLocations] = useState([]);

  //friends selected in the dropdown for invitations.
  const [friendsToInvite, updateFriendsToInvite] = useState([]);

  //populates the dropdown of existing trips.  called by a useEffect.
  const fetchTrips = async () => {
    let response = await fetch(`/api/v1/trips`, {
      method: "GET",
      headers: {
        Accept: "application/ld+json",
      },
    });

    let data = await response.json();
    console.log(data);
    return data;
  };

  useEffect(() => {
    fetchTrips().then((trips) => {
      updateTrips(trips);
    });
  }, []);
  //end trip list population code

  //fetches weather data for the locations in the trip, runs whenever the list of locations changes.
  useEffect(() => {
    const weatherUpdates = trip.locations.map(async (loc) => {
      console.log("Weather Location: ", loc);
      let response = await fetch(
        `https://api.weather.gov/gridpoints/${loc.office}/${loc.office_x},${loc.office_y}/forecast`,
        {
          method: "GET",
          headers: {
            Accept: "application/ld+json",
          },
        }
      );

      let data = await response.json();
      return data;
    });

    let weatherUpdatesResolved = Promise.all(weatherUpdates).then((data) => {
      return data.map((forecast, index) => {
        return {
          [trip.locations[index].name]: forecast,
        };
      });
    });
    weatherUpdatesResolved.then((weatherToAdd) => {
      console.log("weatherToAdd:", weatherToAdd);
      updateWeather(Object.assign({}, ...weatherToAdd));
    });
  }, [trip.locations.length]);

  //adds or removes a location from the trip.
  const handleWeatherSelection = (loc) => {
    if (trip.locations.includes(loc)) {
      updateTrip({
        ...trip,
        locations: trip.locations.filter((location) => location !== loc),
      });
    } else {
      updateTrip({
        ...trip,
        locations: trip.locations.concat(loc),
      });
    }
  };

  //default location for the map control.  Used by MapControl to update location.
  const [position, updatePosition] = useState({
    name: "Jackson Falls",
    location: { lat: 37.5081391, lng: -88.6832446 },
  });

  //saves the trip to the database.
  const saveTrip = async () => {
    updateTripSaving(true);
    let response = await fetch(`/api/v1/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({
        trip: {
          name: trip.name,
          locations: JSON.stringify(
            trip.locations.map((loc) => {
              return loc.id;
            })
          ),
          owner_id: localUser.id,
        },
      }),
    });

    let data = await response.json();
    updateTripSaving(false);
    return data;
  };

  //populates the dropdown for inviting friends.
  const friendSelectOptions = localUser.friendships.map((friend) => {
    console.log("a friend", friend);
    return {
      value: friend.uuid,
      label: friend.email + " - " + friend.name,
    };
  });

  //sends invitations to the selected friends.
  const sendInvitations = () => {
    console.log("inviting:", JSON.stringify(friendsToInvite));
    console.log("trip:", JSON.stringify(trip));
    console.log(
      "friendsToInvite(uuids):",
      friendsToInvite.map((friend) => friend.value)
    );
    fetch(`/trip_invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({
        trip_invitation: {
          trip_id: trip.id,
          issuer_id: localUser.id,
          invitee_uuids: JSON.stringify(
            friendsToInvite.map((friend) => friend.value)
          ),
        },
      }),
    }).then((response) => {
      console.log(response);
    });
  };

  return (
    <div className="w-full flex flex-row justify-center h-full">
      <div className="flex flex-col justify-start h-fit w-full text-cream max-w-3xl">
        <div className="flex flex-col items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-auburn h-screen overflow-scroll">
          <h1 className="text-cream text-2xl font-bold mb-2 bg-auburn p-2 w-full text-center">
            Plan a Trip
          </h1>
          <div className="flex flex-col justify-start items-center h-fit w-full bg-night text-cream max-w-3xl">
            <div className="flex flex-col items-center p-2">
              <div
                className="text-cream bg-auburn p-2 rounded shadow-lg cursor-pointer"
                onClick={() => updateOpenMap(!openMap)}
              >
                {openMap ? "Close Map" : "Link New Locations to Account"}
              </div>
            </div>
            {openMap && (
              <MapControl
                {...{
                  position,
                  updatePosition,
                  savedLocations,
                  updateSavedLocations,
                  weatherTargets: trip.locations,
                  updateWeatherTargets: handleWeatherSelection,
                  localUser,
                }}
              />
            )}
            {trips.length > 0 && (
              <select
                className="w-fit p-2 bg-auburn text-cream rounded-md mb-2"
                onChange={(e) => {
                  //one of these is probably a string, the other an integer and we're using ===
                  const trip = trips.filter(
                    (trip) => trip.id === parseInt(e.target.value)
                  )[0];

                  updateTrip({
                    id: trip.id,
                    name: trip.name,
                    locations: trip.locations.map((loc) => ({
                      id: loc.id,
                      name: loc.name,
                      office: loc.office,
                      office_x: loc.office_x,
                      office_y: loc.office_y,
                      location: { lat: loc.latitude, lng: loc.longitude },
                    })),
                  });
                }}
              >
                <option selected disabled>
                  Select Existing Trip
                </option>
                {trips.map((trip) => {
                  return (
                    <option key={trip.id} value={trip.id}>
                      {trip.name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          <LocationsSelector
            trip={trip}
            updateTrip={updateTrip}
            locationOptions={userSavedLocations}
            updateLocations={handleWeatherSelection}
          />
          {trip.locations.length > 0 && <GraphSwitcher weather={weather} />}
          {trip.locations.length > 0 && (
            <Distance locations={trip.locations} localUser={localUser} />
          )}
          <Select
            options={friendSelectOptions}
            isMulti
            onChange={(selected) => {
              console.log("selected", selected);
              updateFriendsToInvite(selected);
            }}
            placeholder="Invite Friends"
            className="w-full p-2  bg-auburn text-night rounded-md mb-2"
          />
          <button
            onClick={sendInvitations}
            className="bg-auburn text-cream w-fit h-fit p-2 rounded-md"
          >
            Send Invitations
          </button>
          <div>{JSON.stringify(trip.trip_invitations)}</div>
          <div className="mb-16 mt-2">
            <button
              className={classNames("bg-auburn text-cream p-2 rounded-md", {
                "opacity-50": trip.locations.length === 0,
                "cusor-pointer": trip.locations.length > 0,
              })}
              onClick={() => {
                saveTrip().then((trip) => {
                  updateTrips([...trips, trip]);
                });
              }}
              disabled={trip.locations.length === 0 || tripSaving}
            >
              Save Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlan;
