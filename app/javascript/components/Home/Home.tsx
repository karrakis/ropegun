import React, { useState, useEffect } from "react";
import NavContainerGray from "../NavContainer/NavContainerGray";
import SectionHeader from "../NavContainer/SectionHeader";
import LinkBox from "../NavContainer/LinkBox";
import MapControl from "../Map/MapControl";
import Graph from "../Weather/Graph";
import AreaGraph from "../Weather/AreaGraph";

export const Climbers = () => {
  return (
    <NavContainerGray>
      <SectionHeader>Climbers</SectionHeader>
      <LinkBox title="Find Opportunities" onClick={() => {}} />
      <LinkBox title="Advertise Skills" onClick={() => {}} />
    </NavContainerGray>
  );
};

export const Organizers = () => {
  return (
    <NavContainerGray>
      <SectionHeader>Organizers</SectionHeader>
      <LinkBox title="Create Opportunities" onClick={() => {}} />
      <LinkBox title="Manage Opportunities" onClick={() => {}} />
    </NavContainerGray>
  );
};

export const Home = ({ userSavedLocations, localUser }) => {
  const [weather, updateWeather] = useState({});
  const [weatherTargets, updateWeatherTargets] = useState(
    userSavedLocations || []
  );
  const [position, updatePosition] = useState({
    name: "Jackson Falls",
    location: { lat: 37.5081391, lng: -88.6832446 },
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

  const weatherDataTemperature = Object.keys(weather).map((placeName) => {
    const days = weather[placeName].periods
      .map((p) => p.endTime.slice(0, 10))
      .filter((el, i, arr) => arr.indexOf(el) === i);
    return days.map((day) => {
      const periods = weather[placeName].periods.filter(
        (p) =>
          p.endTime.slice(0, 10) === day || p.startTime.slice(0, 10) === day
      );
      const temperatures = periods.map((p) => p.temperature).sort();
      const temperatureOutput = [
        temperatures[0],
        temperatures[temperatures.length - 1],
      ];
      return {
        day,
        [placeName]: temperatureOutput,
      };
    });u
  });

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start h-screen overflow-scroll w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-col items-center p-2">
          <div
            className="text-cream bg-auburn p-2 rounded shadow-lg cursor-pointer"
            onClick={() => updateOpenMap(!openMap)}
          >
            {openMap ? "Close Map" : "Add Weather Locations"}
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
        <div className="bg-night w-full text-cream text-center pt-12 border border-cream border-b-0">
          {weatherDataTemperature.length > 0 && (
            <AreaGraph data={weatherDataTemperature} />
          )}
        </div>
        <div className="flex flex-col w-full">
          <div className="text-cream w-full bg-night border border-cream text-center">
            Weather
          </div>
          <div className="flex flex-col p-2">
            {Object.keys(weather).map((placeName) => {
              const forecasts = weather[placeName];

              return (
                <div className="bg-night w-full flex flex-col my-2 p-2 rounded border border-cream shadow-lg">
                  <div>{placeName}</div>
                  <div className="flex flex-row overflow-scroll">
                    {forecasts?.periods.map((period) => {
                      return (
                        <div className="flex flex-col m-2 border border-cream p-2">
                          <div>{period.name}</div>
                          <div>{period.temperature}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
