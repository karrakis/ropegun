import React, { useState, useEffect } from "react";
import classNames from "classnames";
import GraphSwitcher from "../Weather/GraphSwitcher";
import Distance from "../Distance/Distance";

export const TripPlan = ({
  user,
  localUser,
  userSavedLocations,
  tripSavedLocations = [],
}) => {
  const [trip, updateTrip] = useState({
    name: "",
    locations: tripSavedLocations || [],
  });

  const [weather, updateWeather] = useState({});
  const [weatherTargets, updateWeatherTargets] = useState(trip.locations || []);
  const [locationsSelectorsVisible, updateLocationsSelectorsVisible] =
    useState(false);

  useEffect(() => {
    const weatherUpdates = weatherTargets.map(async (loc) => {
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
          [weatherTargets[index].name]: forecast,
        };
      });
    });
    weatherUpdatesResolved.then((weatherToAdd) => {
      updateWeather(Object.assign({}, ...weatherToAdd));
    });
  }, [weatherTargets]);

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

  useEffect(() => {
    updateWeatherTargets(trip.locations);
  }, [trip.locations.length]);

  console.log("rendering tripPlan");

  return (
    <div className="w-full flex flex-row justify-center h-full">
      <div className="flex flex-col justify-start h-full overflow-scroll w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-col items-center p-2 bg-cream text-auburn h-full overflow-scroll">
          <h1>Plan a Trip</h1>
          <form className="mb-2">
            <input
              className="w-full p-2 bg-night text-cream rounded-t-md"
              type="text"
              placeholder="Name Your Trip"
            />
            <div
              className={classNames(
                "bg-auburn text-cream cursor-pointer p-2 text-center",
                {
                  "rounded-b-md": !locationsSelectorsVisible,
                }
              )}
              onClick={() => {
                updateLocationsSelectorsVisible(!locationsSelectorsVisible);
              }}
            >
              Add Locations
            </div>
            <div
              className={classNames(
                "text-cream",
                "bg-night",
                "flex",
                "flex-col",
                "p-2",
                "rounded-b-md",
                {
                  block: locationsSelectorsVisible,
                  hidden: !locationsSelectorsVisible,
                }
              )}
            >
              {userSavedLocations.map((loc) => {
                return (
                  <div className="flex">
                    <input
                      type="checkbox"
                      key={loc.id}
                      id={loc.name}
                      value={loc.id}
                      onChange={() => handleWeatherSelection(loc)}
                    />
                    <label htmlFor={loc.name}>{loc.name}</label>
                  </div>
                );
              })}
            </div>
          </form>
          <GraphSwitcher weather={weather} />
          <Distance locations={trip.locations} localUser={localUser} />
          <div>
            <button
              onClick={() => {
                console.log(trip);
              }}
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
