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
  if (path === "/trip_plan/new") return { screen: "setup", tripId: null };
  const addLocationMatch = path.match(/^\/trip_plan\/(\d+)\/add_location$/);
  if (addLocationMatch)
    return { screen: "add_location", tripId: addLocationMatch[1] };
  const idMatch = path.match(/^\/trip_plan\/(\d+)$/);
  if (idMatch) return { screen: "created", tripId: idMatch[1] };
  return { screen: "home", tripId: null };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TripPlan = ({ localUser }: TripPlanProps) => {
  const [path, setPath] = useState(currentPath());
  const [createdTrip, setCreatedTrip] = useState<any>(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [addLocationError, setAddLocationError] = useState<string | null>(null);

  // Listen for popstate (back/forward + our navigate() calls)
  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const { screen, tripId } = parsePath(path);

  // When URL says "created/:id" (or its "add_location" sub-screen) but we
  // don't have the trip in memory, fetch it.
  useEffect(() => {
    if (
      (screen === "created" || screen === "add_location") &&
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

  const handleTripCreated = (trip: any) => {
    setCreatedTrip(trip);
    navigate(`/trip_plan/${trip.id}`);
  };

  // Adding a location is a full-page map step (not a modal) so it has room
  // to work on phones. Picking "Add to Trip" there PATCHes it straight onto
  // the trip and returns to the editor, rather than staging a list first.
  const handleLocationAddedToTrip = async (location: PendingDestination) => {
    if (!tripId) return;
    setAddLocationError(null);
    try {
      const res = await fetch(`/api/v1/trips/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({ trip: { locations: [location] } }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setCreatedTrip(await res.json());
      navigate(`/trip_plan/${tripId}`);
    } catch (e: any) {
      setAddLocationError(e.message ?? "Could not add that location.");
    }
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

          {/* ── Setup ── */}
          {screen === "setup" && (
            <>
              <h1 className="text-cream text-2xl font-bold bg-auburn p-2 w-full text-center z-10">
                Name your trip
              </h1>
              <TripSetup
                localUser={localUser}
                onTripCreated={handleTripCreated}
                onBack={() => navigate("/trip_plan")}
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
              onAddLocation={() =>
                navigate(`/trip_plan/${tripId}/add_location`)
              }
            />
          )}
        </div>
      )}

      {/* ── Add a location to an existing trip ── */}
      {screen === "add_location" && tripId && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col">
          <div className="w-full flex items-center gap-2 bg-auburn p-2 z-10">
            <BackCaret onClick={() => navigate(`/trip_plan/${tripId}`)} />
            <h1 className="text-cream text-2xl font-bold truncate">
              Add a location
            </h1>
          </div>
          {addLocationError && (
            <div className="text-red-400 text-sm px-3 pt-2">
              {addLocationError}
            </div>
          )}
          <DestinationSelector onDestinationAdded={handleLocationAddedToTrip} />
        </div>
      )}
    </div>
  );
};

export default TripPlan;
