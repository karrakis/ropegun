import React, { useState, useEffect } from "react";
import classNames from "classnames";
import GraphSwitcher from "../Weather/GraphSwitcher";
import Distance from "../Distance/Distance";
import TripEdit from "./TripEdit/TripEdit";
import People from "./People/People";
import Skills from "./Skills/Skills";

import { Transition } from "@headlessui/react";

import { csrfToken } from "../../utilities/csrfToken";

import { TripPlanProps, Trips, Trip } from "../types";
import { Location } from "../types";

export const TripPlan = ({
  localUser,
}: TripPlanProps) => {
  const [activeTab, updateActiveTab] = useState("editTrip");

  const defaultTrip = {
    id: 0,
    name: "New Trip",
    locations: [],
    owner: localUser,
  };

  const [trip, _updateTrip] = useState<Trip>(
    localStorage.trip ? JSON.parse(localStorage.trip) : defaultTrip
  );

  useEffect(() => {
    localStorage.setItem("trip", JSON.stringify(trip));
  }, [trip]);

  //possibly excessive, but ensures that when a trip is selected, it is brought up to date.
  const setTrip = (trip: Trip) => {
    if(trip.id === 0) {
      _updateTrip(defaultTrip);
      return;
    } else {
      fetch(`/api/v1/trips/${trip.id}`, {
        method: "GET",
        headers: {
          Accept: "application/ld+json",
        },
      }).then((response) => {
        response.json().then((data) => {
          _updateTrip({
            id: data.id,
            name: data.name,
            owner: data.owner,
            locations: data.locations,
            trip_invitations: data.trip_invitations,
          });
        });
      });
    }
  };

  //disables the save button while saving is in progress to prevent bad user experience.
  const [tripSaving, updateTripSaving] = useState(false);

  //primarily used for the dropdown of existing trips.
  const [trips, updateTrips] = useState<Trip[]>([defaultTrip]);

  //weather data for the locations in the trip.
  const [weather, updateWeather] = useState({});

  //saved locations for the user.  Deprecated?
  // const [savedLocations, updateSavedLocations] = useState([]);

  //populates the dropdown of existing trips.  called by a useEffect.
  const fetchTrips = async () => {
    let response = await fetch(`/api/v1/trips`, {
      method: "GET",
      headers: {
        Accept: "application/ld+json",
      },
    });

    let data = await response.json();
    return data;
  };

  useEffect(() => {
    fetchTrips().then((trips) => {
      updateTrips([defaultTrip, ...trips]);
    });
  }, []);
  //end trip list population code

  //fetches weather data for the locations in the trip, runs whenever the list of locations changes.
  useEffect(() => {
    const weatherUpdates = trip.locations.map(async (loc) => {
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
      updateWeather(Object.assign({}, ...weatherToAdd));
    });
  }, [trip.locations.length]);

  //adds or removes a location from the trip.
  const handleWeatherSelection = (loc: Location) => {
    if (trip.locations.map((location) => location.id).includes(loc.id)) {
      _updateTrip({
        ...trip,
        locations: trip.locations.filter((location) => location.id !== loc.id),
      });
    } else {
      _updateTrip({
        ...trip,
        locations: trip.locations.concat(loc),
      });
    }
  };

  //default location for the map control.  Used by MapControl to update location.
  const [position, updatePosition] = useState({
    name: "Jackson Falls",
    location: { lat: 37.5081391, lng: -88.6832446 },
    latitude: 37.5081391,
    longitude: -88.6832446,
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
    _updateTrip(data);
    return data;
  };

  const InfoTab = ({ children, onSelect, selected }) => {
    return (
      <div
        className={classNames(
          "row-span-1",
          "md:col-span-1",
          "justify-center",
          "items-center",
          "my-1",
          "md:mx-1",
          "h-12",
          "flex",
          "cursor-pointer",
          {
            "bg-night": selected,
            "bg-khaki": !selected,
            "text-cream": selected,
            "text-night": !selected,
          }
        )}
        onClick={onSelect}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-row justify-center h-full">
      <div className="flex flex-col justify-start h-fit w-full text-cream max-w-3xl">
        <div className="flex flex-col items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-auburn h-screen overflow-scroll">
          <h1 className="text-cream text-2xl font-bold bg-auburn p-2 w-full text-center z-10">
            Plan a Trip
          </h1>
          <Transition
            show={trip.locations.length > 0}
            enter="transition ease duration-700 transform"
            enterFrom="opacity-0 -translate-y-full"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease duration-1000 transform"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-full"
          >
            <div className="grid grid-rows-5 md:grid-cols-5 p-4 w-full text-center h-fit md:h-16">
              <InfoTab
                onSelect={() => updateActiveTab("editTrip")}
                selected={activeTab == "editTrip"}
              >
                <h3 className="">Edit Trip</h3>
              </InfoTab>
              <InfoTab
                onSelect={() => updateActiveTab("weather")}
                selected={activeTab == "weather"}
              >
                <h3 className="">Weather</h3>
              </InfoTab>
              <InfoTab
                onSelect={() => updateActiveTab("distance")}
                selected={activeTab == "distance"}
              >
                <h3 className="">Distance</h3>
              </InfoTab>
              <InfoTab
                onSelect={() => updateActiveTab("people")}
                selected={activeTab == "people"}
              >
                <h3 className="">People</h3>
              </InfoTab>
              <InfoTab
                onSelect={() => updateActiveTab("skillsGear")}
                selected={activeTab == "skillsGear"}
              >
                <h3 className="">Skills & Gear</h3>
              </InfoTab>
            </div>
          </Transition>
          {activeTab === "editTrip" && (
            <TripEdit
              trip={trip}
              setTrip={setTrip}
              updateTrip={_updateTrip}
              trips={trips}
              position={position}
              updatePosition={updatePosition}
              handleWeatherSelection={handleWeatherSelection}
              localUser={localUser}
            />
          )}
          {activeTab === "weather" && trip.locations.length > 0 && (
            <div className="w-full z-10">
              <GraphSwitcher weather={weather} />
            </div>
          )}

          {activeTab === "distance" && trip.locations.length > 0 && (
            <div className="w-full z-10">
              <Distance
                locations={trip.locations}
                tripOwner={trip.owner}
                trip={trip}
              />
            </div>
          )}
          {activeTab === "people" && (
            <People
              trip={trip}
              localUser={localUser}
              updateTrips={updateTrips}
            />
          )}
          {activeTab === "skillsGear" && (
            <Skills
              organizer={trip.owner}
              guests={trip.trip_invitations}
              trip={trip}
            />
          )}
          <div className="mb-16 mt-2">
            <button
              className={classNames("bg-auburn text-cream p-2 rounded-md", {
                "opacity-50": trip.locations.length === 0,
                "cusor-pointer": trip.locations.length > 0,
              })}
              onClick={() => {
                saveTrip().then((trip) => {
                  updateTrips([...trips, trip])
                })
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
