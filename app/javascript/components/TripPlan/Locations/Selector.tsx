import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Trip, Location } from "../../types";

export const LocationsSelector = ({
  trip,
  updateTrip,
}: {trip: Trip, updateTrip: (trip: Trip) => void}) => {
  const [locationsSelectorsVisible, updateLocationsSelectorsVisible] =
    useState(false);

  useEffect(() => {
    console.log("line 14", trip.locations);
  }, [trip.locations]);

  const locationSelected = (loc: Location) => {
    return trip.locations.find((tripLoc) => tripLoc.latitude === loc.latitude && tripLoc.longitude === loc.longitude);
  };

  return (
    <form className="mb-2">
      <input
        className="w-full p-2 bg-night text-cream rounded-t-md mt-2"
        type="text"
        placeholder={trip.name || "Name Your Trip"}
        onChange={(e) => updateTrip({ ...trip, name: e.target.value })}
      />
      <div
        className={classNames(
          "bg-auburn text-cream cursor-pointer p-2 text-center",
          {
            "rounded-b-md": !locationsSelectorsVisible,
          }
        )}
        onClick={() => {
          updateLocationsSelectorsVisible(!locationsSelectorsVisible);
        }}
      >
        Edit Trip Locations
      </div>
      <div
        className={classNames(
          "text-cream",
          "bg-night",
          "flex",
          "flex-col",
          "p-2",
          "rounded-b-md",
          {
            block: locationsSelectorsVisible,
            hidden: !locationsSelectorsVisible,
          }
        )}
      >
        {trip.locations.map((loc) => {
          return (
            <div className="flex items-center border-b border-khaki justify-between py-2" key={loc.latitude + loc.longitude}>
              
              <span className="pr-2">{loc.name}</span>
              <button
                className="cursor-pointer text-auburn border rounded border-auburn bg-cream px-1"
                key={loc.id}
                id={loc.name}
                value={loc.id}
                onClick={() => updateTrip({
                  ...trip,
                  locations: trip.locations.filter((tripLoc) => tripLoc.latitude !== loc.latitude && tripLoc.longitude !== loc.longitude),
                })}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </form>
  );
};

export default LocationsSelector;
