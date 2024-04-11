import React from "react";
import GoogleMap from "./Map";

export const MapControl = ({
  position,
  updatePosition,
  savedLocations,
  updateSavedLocations,
  weatherTargets,
  updateWeatherTargets,
  localUser,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row  justify-start md:justify-center w-full">
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
          <div className="p-2 m-2 w-full bg-auburn text-cream w-full flex flex-col">
            <div>{position.name}</div>
            <div>
              {position.location.lat}, {position.location.lng}
            </div>
          </div>
        </div>
        <div className="text-cream mb-2">Locations:</div>
        {savedLocations.map((location) => {
          return (
            <div className="my-2 flex h-10">
              <span className="border border-auburn rounded mr-2 p-2 flex-none">
                {location.name}
              </span>
              <div className="flex-none p-2">
                <span>{location.location.lat}</span>,{" "}
                <span className="flex-none p-2">{location.location.lng}</span>
              </div>
              <div className="w-full">
                <div
                  className="text-cream bg-auburn p-2 rounded shadow-lg w-auto h-full aspect-square flex justify-center items-center"
                  onClick={() =>
                    updateSavedLocations(
                      savedLocations.filter((loc) => loc !== location)
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  x
                </div>
              </div>
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
    </>
  );
};

export default MapControl;
