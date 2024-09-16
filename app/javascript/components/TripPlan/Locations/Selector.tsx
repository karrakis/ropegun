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

  const locationIds = trip.locations.map((loc) => loc.id);
  const locationSelected = (loc) => locationIds.includes(loc.id);

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
          return (
            <div className="flex" key={loc.id}>
              <input
                type="checkbox"
                key={loc.id}
                id={loc.name}
                value={loc.id}
                onChange={() => updateLocations(loc)}
                checked={locationSelected(loc)}
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
