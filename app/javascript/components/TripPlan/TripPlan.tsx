import React, { useState, useEffect } from "react";
import classNames from "classnames";
import GraphSwitcher from "../Weather/GraphSwitcher";
import Distance from "../Distance/Distance";
import LocationsSelector from "./Locations/Selector";
import MapControl from "../Map/MapControl";

export const TripPlan = ({
  localUser,
  userSavedLocations,
  tripSavedLocations = [],
}) => {
  const [trip, updateTrip] = useState({
    name: "",
    locations: tripSavedLocations || [],
  });

  const [weather, updateWeather] = useState({});
  const [openMap, updateOpenMap] = useState(false);
  const [savedLocations, updateSavedLocations] = useState([]);

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

  const [position, updatePosition] = useState({
    name: "Jackson Falls",
    location: { lat: 37.5081391, lng: -88.6832446 },
  });

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
      updateWeather(Object.assign({}, weather, ...weatherToAdd));
    });
  }, [trip.locations.length]);

  return (
    <div className="w-full flex flex-row justify-center h-full">
      <div className="flex flex-col justify-start h-fit w-full text-cream max-w-3xl">
        <div className="flex flex-col items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-auburn h-screen overflow-scroll">
          <h1 className="text-cream text-2xl font-bold mb-2 bg-auburn p-2 w-full text-center">
            Plan a Trip
          </h1>
          <div className="flex flex-col justify-start h-fit w-full bg-auburn text-cream max-w-3xl">
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
          </div>
          <LocationsSelector
            locationOptions={userSavedLocations}
            updateLocations={handleWeatherSelection}
          />
          {trip.locations.length > 0 && <GraphSwitcher weather={weather} />}
          {trip.locations.length > 0 && (
            <Distance locations={trip.locations} localUser={localUser} />
          )}
          <div className="mb-16 mt-2">
            <button
              className={classNames("bg-auburn text-cream p-2 rounded-md", {
                "opacity-50": trip.locations.length === 0,
                "cusor-pointer": trip.locations.length > 0,
              })}
              onClick={() => {
                if (trip.locations.length === 0) return;
                console.log(trip);
              }}
              disabled={trip.locations.length === 0}
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
