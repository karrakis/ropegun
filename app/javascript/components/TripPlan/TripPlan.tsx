import React, { useState, useEffect } from "react";
import {
  DestinationSelector,
  PendingDestination,
} from "../Map/DestinationSelector";
import { TripSetup } from "./TripSetup";
import { TripSummary } from "./TripSummary";
import { ExistingTrips } from "./ExistingTrips";
import { BackCaret } from "./BackCaret";
import { TripPlanProps } from "../types";
import { csrfToken } from "../../utilities/csrfToken";
import { getConsumer } from "../../utilities/cable";

// ─── URL-based navigation ─────────────────────────────────────────────────────

function currentPath() {
  return window.location.pathname;
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function parsePath(path: string): { screen: string; tripId: string | null } {
  if (path === "/trip_plan" || path === "/trip_plan/")
    return { screen: "home", tripId: null };
  if (path === "/trip_plan/trips") return { screen: "existing", tripId: null };
  if (path === "/trip_plan/new")
    return { screen: "destinations", tripId: null };
  if (path === "/trip_plan/new/setup") return { screen: "setup", tripId: null };
  const idMatch = path.match(/^\/trip_plan\/(\d+)$/);
  if (idMatch) return { screen: "created", tripId: idMatch[1] };
  return { screen: "home", tripId: null };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TripPlan = ({ localUser }: TripPlanProps) => {
  const [path, setPath] = useState(currentPath());
  const [tripLocations, setTripLocations] = useState<PendingDestination[]>([]);
  const [createdTrip, setCreatedTrip] = useState<any>(null);
  const [tripLoading, setTripLoading] = useState(false);

  // Listen for popstate (back/forward + our navigate() calls)
  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const { screen, tripId } = parsePath(path);

  // When URL says "created/:id" but we don't have the trip in memory, fetch it
  useEffect(() => {
    if (
      screen === "created" &&
      tripId &&
      (!createdTrip || String(createdTrip.id) !== tripId)
    ) {
      setTripLoading(true);
      fetch(`/api/v1/trips/${tripId}`, {
        headers: { Accept: "application/json" },
      })
        .then((r) => r.json())
        .then((t) => {
          setCreatedTrip(t);
          setTripLoading(false);
        })
        .catch(() => {
          setTripLoading(false);
          navigate("/trip_plan");
        });
    }
  }, [screen, tripId]);

  // While a trip is open, subscribe to its channel so changes made by other
  // members (gear/skills commitments, membership changes, trip edits) show
  // up here live. The server broadcasts the full updated trip JSON (same
  // shape as the `show` fetch above), so we can apply it directly instead
  // of re-fetching.
  useEffect(() => {
    if (screen !== "created" || !tripId) return;

    const subscription = getConsumer().subscriptions.create(
      { channel: "TripChannel", trip_id: tripId },
      {
        received: (data: any) => setCreatedTrip(data),
      },
    );

    return () => subscription.unsubscribe();
  }, [screen, tripId]);

  const handleDestinationAdded = (location: PendingDestination) => {
    setTripLocations((prev) => {
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

  const handleTripCreated = (trip: any) => {
    setCreatedTrip(trip);
    navigate(`/trip_plan/${trip.id}`);
  };

  const continueRoute = () => {
    if (tripLocations.length === 0) return;
    navigate("/trip_plan/new/setup");
  };

  return (
    <div className="w-full flex flex-row justify-center h-full">
      <div className="flex flex-col justify-start h-fit w-full text-cream max-w-3xl h-screen-minus-header">
        <div className="flex flex-col items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-auburn grow overflow-scroll">
          {/* ── Home ── */}
          {screen === "home" && (
            <div className="w-full flex flex-col items-center justify-center grow gap-4 py-12 px-4">
              <h1 className="text-cream text-2xl font-bold bg-auburn p-2 w-full text-center">
                Trip Planning
              </h1>
              <div className="flex flex-col w-full max-w-sm gap-3 mt-4">
                <button
                  className="w-full bg-auburn text-cream py-4 rounded text-lg font-semibold shadow"
                  onClick={() => navigate("/trip_plan/new")}
                >
                  + Start a new trip
                </button>
                <button
                  className="w-full bg-night text-cream py-4 rounded text-lg font-semibold shadow"
                  onClick={() => navigate("/trip_plan/trips")}
                >
                  Open an existing trip
                </button>
              </div>
            </div>
          )}

          {/* ── Existing trips ── */}
          {screen === "existing" && (
            <>
              <div className="w-full flex items-center gap-2 bg-auburn p-2 z-10">
                <BackCaret onClick={() => navigate("/trip_plan")} />
                <h1 className="text-cream text-2xl font-bold truncate">
                  Your Trips
                </h1>
              </div>
              <div className="w-full mt-2">
                <ExistingTrips
                  localUser={localUser}
                  onTripSelected={(trip) => {
                    setCreatedTrip(trip);
                    navigate(`/trip_plan/${trip.id}`);
                  }}
                />
              </div>
            </>
          )}

          {/* ── Pick destinations ── */}
          {screen === "destinations" && (
            <>
              <div className="w-full flex items-center gap-2 bg-auburn p-2 z-10">
                <BackCaret onClick={() => navigate("/trip_plan")} />
                <h1 className="text-cream text-2xl font-bold truncate">
                  Where to?
                </h1>
              </div>

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

          {/* ── Setup ── */}
          {screen === "setup" && (
            <>
              <h1 className="text-cream text-2xl font-bold bg-auburn p-2 w-full text-center z-10">
                Set up your trip
              </h1>
              <TripSetup
                locations={tripLocations}
                localUser={localUser}
                onTripCreated={handleTripCreated}
                onBack={() => navigate("/trip_plan/new")}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Trip Summary ── */}
      {screen === "created" && (
        <div className="fixed inset-0 z-50 bg-cream overflow-y-auto">
          {tripLoading || !createdTrip ? (
            <p className="text-ashgray text-sm p-8">Loading trip…</p>
          ) : (
            <TripSummary
              trip={createdTrip}
              localUser={localUser}
              onTripUpdated={setCreatedTrip}
              onBack={() => navigate("/trip_plan/trips")}
            />
          )}
          <button
            className="fixed bottom-4 right-4 bg-night text-cream text-xs px-3 py-2 rounded shadow"
            onClick={() => {
              setTripLocations([]);
              setCreatedTrip(null);
              navigate("/trip_plan");
            }}
          >
            + New trip
          </button>
        </div>
      )}
    </div>
  );
};

export default TripPlan;
