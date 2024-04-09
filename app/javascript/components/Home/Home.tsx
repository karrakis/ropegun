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

export const Home = ({ userSavedLocations, localUser }) => {
  console.log("userSavedLocations", userSavedLocations);
  console.log("rendering home");
  const [weather, updateWeather] = useState({});
  const [weatherTargets, updateWeatherTargets] = useState(
    userSavedLocations || []
  );
  const [position, updatePosition] = useState({
    name: "Jackson Falls",
    location: { lat: 37.5081391, lng: -88.6832446 },
  });
  console.log("user saved locations:", userSavedLocations);
  const [savedLocations, updateSavedLocations] = useState([]);
  console.log("saved locations:", savedLocations);

  // const fetchWeather = async () => {
  //   const weatherUpdate = await Promise.all(
  //     weatherTargets.map((loc) => {
  //       if (loc.office && loc.office_x && loc.office_y) {
  //         if (!weather[loc.name]) {
  //           return fetch(
  //             `https://api.weather.gov/gridpoints/${loc.office}/${loc.office_x},${loc.office_y}/forecast`,
  //             {
  //               method: "GET",
  //               headers: {
  //                 Accept: "application/ld+json",
  //               },
  //             }
  //           );
  //           .then((res) => res.json())
  //           .then((data) => {
  //             { [loc.name]: data };
  //           });
  //         }
  //       }
  //     })
  //   );
  //   updateWeather(Object.assign({}, weather, weatherUpdate));
  // };
  useEffect(() => {
    // fetchWeather();
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
          <button
            className="p-2 m-2 bg-cream text-auburn rounded shadow-lg"
            onClick={() => {
              savedLocations.forEach((loc) => {
                fetch(
                  `https://api.weather.gov/points/${loc.location.lat},${loc.location.lng}`,
                  {
                    method: "GET",
                    headers: {
                      Accept: "application/ld+json",
                    },
                  }
                )
                  .then((res) => res.json())
                  .then((data) => {
                    const body = {
                      location: {
                        latitude: loc.location.lat,
                        longitude: loc.location.lng,
                        name: loc.name,
                        user_id: localUser.id,
                        office: data.gridId,
                        office_x: data.gridX,
                        office_y: data.gridY,
                      },
                    };
                    fetch("/locations", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": document.querySelector(
                          '[name="csrf-token"]'
                        ).content,
                      },
                      body: JSON.stringify(body),
                    });
                    updateWeatherTargets(weatherTargets.concat(body.location));
                  });
              });
            }}
          >
            Save Locations
          </button>
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
