import React, { useState, useEffect } from "react";
import Graph from "../Weather/Graph";
import classNames from "classnames";

export const TripPlan = ({
  user,
  localUser,
  userSavedLocations,
  tripSavedLocations = [],
}) => {
  //Bunny idea - for weather graphs, instead of using separate data points for night and day, use a single data point with a range.  This would allow for a single line graph with a shaded area for the range of temperatures.  This would be a more compact and visually appealing way to display the data.

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

  const weatherDataFinal: Object[] = [];
  const weatherDataRaw = Object.keys(weather).map((placeName) => {
    return weather[placeName].periods.map((p) =>
      Object.assign({}, { name: p.name, [placeName]: p.temperature })
    );
  });

  weatherDataRaw.forEach((list) => {
    list.forEach((item, i) => {
      weatherDataFinal[i] ||= {};
      weatherDataFinal[i] = Object.assign({}, weatherDataFinal[i], item);
    });
  });

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

  console.log("rendering");

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start h-screen overflow-scroll w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-col items-center p-2 bg-cream text-auburn">
          <h1>Plan a Trip</h1>
          <form>
            <input type="text" placeholder="Name Your Trip" />
            <div
              className="bg-auburn text-cream"
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
          <div>
            {trip.locations.map((loc) => {
              return (
                <div key={"loclist_" + loc.id}>
                  <span>{loc.name}</span>
                  <span>
                    {loc.location.lat}, {loc.location.lng}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="bg-night w-full text-cream text-center pt-12 border border-cream border-b-0">
            {weatherDataFinal.length > 0 && <Graph data={weatherDataFinal} />}
          </div>
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
