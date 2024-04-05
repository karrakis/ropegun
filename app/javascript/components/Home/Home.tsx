import React, { useState, useEffect } from "react";
import NavContainerGray from "../NavContainer/NavContainerGray";
import SectionHeader from "../NavContainer/SectionHeader";
import LinkBox from "../NavContainer/LinkBox";

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

export const Home = () => {
  console.log("rendering home");
  const [weather, updateWeather] = useState({});

  useEffect(() => {
    if (!weather["Jackson Falls"]) {
      fetch("https://api.weather.gov/gridpoints/PAH/128,74/forecast", {
        method: "GET",
        headers: {
          Accept: "application/ld+json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          updateWeather(Object.assign({}, weather, { "Jackson Falls": data }));
        });
    }

    if (!weather["Horseshoe Canyon Ranch"]) {
      fetch("https://api.weather.gov/gridpoints/LZK/45,128/forecast", {
        method: "GET",
        headers: {
          Accept: "application/ld+json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          updateWeather(
            Object.assign({}, weather, { "Horseshoe Canyon Ranch": data })
          );
        });
    }
  }, [weather]);

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start min-h-screen w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-col md:flex-row  justify-start md:justify-center w-full">
          <Climbers />
          <Organizers />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-col">
            {Object.keys(weather).map((placeName) => {
              const forecasts = weather[placeName];
              console.log(placeName);
              console.log("forecasts", forecasts);
              return (
                <div className="bg-night w-full flex flex-col my-2 p-2">
                  <div>{placeName}</div>
                  <div className="flex flex-row overflow-scroll">
                    {forecasts.periods.map((period) => {
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
