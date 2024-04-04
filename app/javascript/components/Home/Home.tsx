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
  const [weather, updateWeather] = useState(null);

  useEffect(() => {
    fetch("https://api.weather.gov/gridpoints/PAH/128,74/forecast", {
      method: "GET",
      headers: {
        Accept: "application/ld+json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        updateWeather(data);
      });
  }, []);

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start min-h-screen w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-col md:flex-row  justify-start md:justify-center w-full">
          <Climbers />
          <Organizers />
        </div>
        <div>
          {weather?.periods?.map((period) => (
            <div key={period.number}>
              <h2>{period.name}</h2>
              <p>{period.detailedForecast}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
