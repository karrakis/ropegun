import React, { useState, useEffect } from "react";
import classNames from "classnames";

export const LocationsSelector = ({
  locationOptions,
  updateLocations,
  trip,
  updateTrip,
}) => {
  const [locationsSelectorsVisible, updateLocationsSelectorsVisible] =
    useState(false);

  useEffect(() => {
    console.log("line 14", trip.locations);
    console.log("line 15", locationOptions);
  }, [trip.locations]);

  return (
    <form className="mb-2">
      <input
        className="w-full p-2 bg-night text-cream rounded-t-md mt-2"
        type="text"
        placeholder="Name Your Trip"
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
        Add Linked Locations to Trip
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
        {locationOptions.map((loc) => {
          console.log("line 45", loc.id);
          return (
            <div className="flex" key={loc.id}>
              <input
                type="checkbox"
                key={loc.id}
                id={loc.name}
                value={loc.id}
                onChange={() => updateLocations(loc)}
                checked={trip.locations
                  .map((tripLocation) => {
                    console.log("line 65", tripLocation.id, loc.id);
                    console.log("line 66", tripLocation.id === loc.id);
                    tripLocation.id === loc.id;
                  })
                  .includes(true)}
              />
              <label htmlFor={loc.name}>{loc.name}</label>
            </div>
          );
        })}
      </div>
    </form>
  );
};

export default LocationsSelector;
