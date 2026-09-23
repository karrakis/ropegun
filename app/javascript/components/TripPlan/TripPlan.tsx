import React, { useState } from "react";
import {
  DestinationSelector,
  PendingDestination,
} from "../Map/DestinationSelector";
import { TripSetup } from "./TripSetup";
import { TripPlanProps } from "../types";
import { csrfToken } from "../../utilities/csrfToken";

type Screen = "destinations" | "setup" | "created";

export const TripPlan = ({ localUser }: TripPlanProps) => {
  const [screen, setScreen] = useState<Screen>("destinations");
  const [tripLocations, setTripLocations] = useState<PendingDestination[]>([]);
  const [createdTrip, setCreatedTrip] = useState<any>(null);

  const handleDestinationAdded = (location: PendingDestination) => {
    setTripLocations((prev) => {
      // Dedup by lat/lng
      if (
        prev.find(
          (l) =>
            l.latitude === location.latitude &&
            l.longitude === location.longitude,
        )
      )
        return prev;
      return [...prev, location];
    });
  };

  const removeLocation = (latitude: string, longitude: string) =>
    setTripLocations((prev) =>
      prev.filter(
        (l) => !(l.latitude === latitude && l.longitude === longitude),
      ),
    );

  const handleTripCreation = (trip: TripProps) => {
    fetch("/api/v1/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ trip }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((trip) => {
        setCreatedTrip(trip);
        setScreen("setup");
      })
      .catch((err) => {
        console.error(err);
        alert("Error creating trip. Please try again.");
      });
  };

  const handleTripUpdate = (trip: any) => {
    fetch(`/api/v1/trips/${trip.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({
        trip: {
          name: trip.name,
          route_mode: trip.route_mode,
          starts_on: trip.starts_on,
          ends_on: trip.ends_on,
          locations: trip.locations.map((loc: any) => ({
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
        },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((trip) => {
        setCreatedTrip(trip);
        setScreen("created");
      })
      .catch((err) => {
        console.error(err);
        alert("Error updating trip. Please try again.");
      });
  };

  const continueRoute = () => {
    if (tripLocations.length === 0) return;
    handleTripCreation({
      locations: tripLocations,
    });
  };

  return (
    <div className="w-full flex flex-row justify-center h-full">
      <div className="flex flex-col justify-start h-fit w-full text-cream max-w-3xl h-screen-minus-header">
        <div className="flex flex-col items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-auburn grow overflow-scroll">
          {/* ── Step 1: pick destinations ── */}
          {screen === "destinations" && (
            <>
              <h1 className="text-cream text-2xl font-bold bg-auburn p-2 w-full text-center z-10">
                Where to?
              </h1>

              <DestinationSelector
                onDestinationAdded={handleDestinationAdded}
              />

              {tripLocations.length > 0 && (
                <div className="w-full mt-2 bg-night p-2 rounded shadow-lg">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-cream font-semibold text-sm">
                      Destinations added ({tripLocations.length})
                    </h2>
                    <button
                      className="bg-auburn text-cream px-4 py-1.5 rounded text-sm font-semibold"
                      onClick={continueRoute}
                    >
                      Continue →
                    </button>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {tripLocations.map((loc) => (
                      <li
                        key={`${loc.latitude}-${loc.longitude}`}
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
                          onClick={() =>
                            removeLocation(loc.latitude, loc.longitude)
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* ── Step 2: name, mode, reorder, create ── */}
          {screen === "setup" && (
            <>
              <h1 className="text-cream text-2xl font-bold bg-auburn p-2 w-full text-center z-10">
                Set up your trip
              </h1>
              <TripSetup
                locations={tripLocations}
                localUser={localUser}
                onTripCreated={handleTripUpdate}
                onBack={() => setScreen("destinations")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlan;
