import React from "react";
import GoogleMap from "./Map";

import { MapControlProps, Location } from "../types";

import { csrfToken } from "../../utilities/csrfToken";

export const MapControl = ({
  position,
  updatePosition,
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
            onClick={() => {
              // updateSavedLocations(savedLocations.concat(position))\

              if (!trip.locations.find((loc: Location) => loc.latitude === position.location.lat && loc.longitude === position.location.lng)) {
                
                fetch(
                  `https://api.weather.gov/points/${position.location.lat},${position.location.lng}`,
                  {
                    method: "GET",
                    headers: {
                      Accept: "application/ld+json"
                    }
                  }
                ).then((res) => res.json()).then((data) => {
                  debugger
                    return {
                      location: {
                        latitude: position.location.lat,
                        longitude: position.location.lng,
                        name: position.name,
                        office: data.gridId,
                        office_x: data.gridX,
                        office_y: data.gridY
                      }
                  }}).then((body) => {
                    fetch(`/api/v1/locations`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken(),
                      },
                      body: JSON.stringify(body),
                    }).then((res) => res.json()).then((data) => {
                      console.log("data:", data);
                      updateTrip({
                        ...trip,
                        locations: trip.locations.concat(data),
                      });
                    });
                  })
                // updateTrip({
                //   ...trip,
                //   locations: trip.locations.concat({...position, latitude: position.location.lat, longitude: position.location.lng}),
                // })
              } else {
              }
            }}
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
