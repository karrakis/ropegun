import React, { useState, useEffect } from "react";
import NavContainerGray from "../NavContainer/NavContainerGray";
import SectionHeader from "../NavContainer/SectionHeader";
import LinkBox from "../NavContainer/LinkBox";
import GoogleMap from "../Map/Map";

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
  const [position, updatePosition] = useState({
    name: "Jackson Falls",
    location: { lat: 37.5081391, lng: -88.6832446 },
  });
  const [savedLocations, updateSavedLocations] = useState([]);

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
          {/* <Climbers />
          <Organizers /> */}
          <GoogleMap
            position={position.location}
            updatePosition={updatePosition}
          />
        </div>

        <div className="flex flex-col w-full bg-night text-cream">
          <div className="flex w-full">
            <button
              className="p-2 m-2 bg-cream text-auburn rounded shadow-lg"
              onClick={() =>
                updateSavedLocations(savedLocations.concat(position))
              }
            >
              Add Location
            </button>
            <button
              className="p-2 m-2 bg-cream text-auburn rounded shadow-lg"
              onClick={() => updateSavedLocations([])}
            >
              Clear Locations
            </button>
            <div className="p-2 m-2 w-full bg-auburn text-cream w-full">
              Current Location: {JSON.stringify(position)}
            </div>
          </div>
          <div className="text-cream mb-2">Locations Logged</div>
          {savedLocations.map((location) => {
            return (
              <div className="my-2">
                <span className="border border-auburn rounded mr-2 p-2">
                  {location.name}
                </span>
                <span>{location.location.lat}</span>,{" "}
                <span>{location.location.lng}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col w-full">
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
