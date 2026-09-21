import React, { useState } from "react";
import { DestinationSelector } from "../Map/DestinationSelector";
import { TripPlanProps } from "../types";

export const TripPlan = ({ localUser }: TripPlanProps) => {
  const [tripLocations, setTripLocations] = useState<any[]>([]);

  const handleDestinationAdded = (location: any) => {
    setTripLocations((prev) => {
      // Avoid duplicates by id
      if (prev.find((l) => l.id === location.id)) return prev;
      return [...prev, location];
    });
  };

  const removeLocation = (id: number) => {
    setTripLocations((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="w-full flex flex-row justify-center h-full">
      <div className="flex flex-col justify-start h-fit w-full text-cream max-w-3xl h-screen-minus-header">
        <div className="flex flex-col items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-auburn grow overflow-scroll">
          <h1 className="text-cream text-2xl font-bold bg-auburn p-2 w-full text-center z-10">
            Where to?
          </h1>

          <DestinationSelector onDestinationAdded={handleDestinationAdded} />

          {tripLocations.length > 0 && (
            <div className="w-full mt-2 fixed bottom-0 bg-night p-2 rounded shadow-lg">
              <h2 className="text-night font-semibold text-sm mb-1 px-1">
                Trip destinations ({tripLocations.length})
              </h2>
              <ul className="flex flex-col gap-1">
                {tripLocations.map((loc) => (
                  <li
                    key={loc.id}
                    className="flex items-center justify-between bg-night text-cream px-3 py-2 rounded"
                  >
                    <div>
                      <div className="font-medium text-sm">{loc.name}</div>
                      <div className="text-xs text-ashgray">
                        {loc.latitude}, {loc.longitude}
                        {loc.office && ` · NWS ${loc.office}`}
                      </div>
                    </div>
                    <button
                      className="text-auburn text-xs underline ml-4"
                      onClick={() => removeLocation(loc.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlan;
