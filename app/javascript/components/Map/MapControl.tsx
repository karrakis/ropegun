import React from "react";
import GoogleMap from "./Map";

import { MapControlProps } from "../types";

export const MapControl = ({
  position,
  updatePosition,
  weatherTargets,
  updateWeatherTargets,
  trip,
  updateTrip,
  localUser,
}: MapControlProps) => {
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
              // updateSavedLocations(savedLocations.concat(position))\

              updateTrip({
                ...trip,
                locations: trip.locations.concat(position),
              })
            }
          >
            Add Location
          </button>
          <button
            className="p-2 m-2 bg-cream text-auburn rounded shadow-lg"
            onClick={() => {
              updateTrip({
                ...trip,
                locations: [],
              });
            }}
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
      </div>
    </>
  );
};

export default MapControl;
