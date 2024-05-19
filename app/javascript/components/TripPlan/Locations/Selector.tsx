import React, { useState, useEffect } from "react";
import classNames from "classnames";

export const LocationsSelector = ({ locationOptions, updateLocations }) => {
  const [locationsSelectorsVisible, updateLocationsSelectorsVisible] =
    useState(false);

  return (
    <form className="mb-2">
      <input
        className="w-full p-2 bg-night text-cream rounded-t-md"
        type="text"
        placeholder="Name Your Trip"
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
        Add Locations
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
