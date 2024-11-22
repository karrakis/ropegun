import React, { useState, useEffect } from "react";
import MapControl from "../Map/MapControl";
import GraphSwitcher from "../Weather/GraphSwitcher";

export const Home = ({ userSavedLocations, localUser }) => {
  const [weather, updateWeather] = useState({});
  const [weatherTargets, updateWeatherTargets] = useState(
    userSavedLocations || []
  );
  const [position, updatePosition] = useState({
    name: "Jackson Falls",
    location: { lat: 37.5081391, lng: -88.6832446 },
    latitude: 37.5081391,
    longitude: -88.6832446,
  });

  const [openMap, updateOpenMap] = useState(weatherTargets.length === 0);

  const [savedLocations, updateSavedLocations] = useState([]);

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
      updateWeather(Object.assign({}, weather, ...weatherToAdd));
    });
  }, [weatherTargets]);

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start h-fit overflow-scroll w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-col items-center p-2">
          <div
            className="text-cream bg-auburn p-2 rounded shadow-lg cursor-pointer"
            onClick={() => updateOpenMap(!openMap)}
          >
            {openMap ? "Close Map" : "Add Locations"}
          </div>
        </div>
        {openMap && (
          <MapControl
            {...{
              position,
              updatePosition,
              savedLocations,
              updateSavedLocations,
              weatherTargets,
              updateWeatherTargets,
              localUser,
            }}
          />
        )}
        <GraphSwitcher weather={weather} />
      </div>
    </div>
  );
};

export default Home;
