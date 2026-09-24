import React, { useState } from "react";
import { csrfToken } from "../../utilities/csrfToken";
import { PendingDestination } from "../Map/DestinationSelector";
// ─── Types ────────────────────────────────────────────────────────────────────

interface Location {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  office: string | null;
}

interface TripSetupProps {
  locations: PendingDestination[];
  localUser: { id: number; name: string };
  onTripCreated: (trip: any) => void;
  onBack: () => void;
}

// ─── Drag-to-reorder list ─────────────────────────────────────────────────────

const ReorderableList = ({
  items,
  onReorder,
  onRemove,
}: {
  items: PendingDestination[];
  onReorder: (items: PendingDestination[]) => void;
  onRemove: (name: string, latitude: string) => void;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDraggingIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    const next = [...items];
    const [moved] = next.splice(draggingIndex, 1);
    next.splice(index, 0, moved);
    setDraggingIndex(index);
    onReorder(next);
  };

  const handleDragEnd = () => setDraggingIndex(null);

  return (
    <ol className="flex flex-col gap-2">
      {items.map((loc, index) => (
        <li
          key={`${loc.latitude}-${loc.longitude}`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 bg-night text-cream px-3 py-2 rounded cursor-grab select-none transition-opacity ${
            draggingIndex === index ? "opacity-40" : "opacity-100"
          }`}
        >
          <span className="text-ashgray text-sm w-5 text-right shrink-0">
            {index + 1}.
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{loc.name}</div>
            <div className="text-xs text-ashgray truncate">
              {loc.latitude}, {loc.longitude}
              {loc.office && ` · NWS ${loc.office}`}
            </div>
          </div>
          <span className="text-ashgray text-xs mr-1 hidden sm:block">
            ⠿ drag to reorder
          </span>
          <button
            className="text-auburn text-xs underline shrink-0"
            onClick={() => onRemove(loc.name, loc.latitude)}
          >
            Remove
          </button>
        </li>
      ))}
    </ol>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const TripSetup: React.FC<TripSetupProps> = ({
  locations: initialLocations,
  localUser,
  onTripCreated,
  onBack,
}) => {
  const [locations, setLocations] =
    useState<PendingDestination[]>(initialLocations);
  const [tripName, setTripName] = useState("");
  const [routeMode, setRouteMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeLocation = (name: string, latitude: string) =>
    setLocations((prev) =>
      prev.filter((l) => !(l.name === name && l.latitude === latitude)),
    );

  const handleCreate = async () => {
    if (locations.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({
          trip: {
            name: tripName.trim() || defaultTripName(locations),
            locations: locations,
            route_mode: routeMode,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      const trip = await res.json();
      onTripCreated(trip);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      {/* Trip name */}
      <div className="flex flex-col gap-1">
        <label className="text-night font-semibold text-sm">Trip name</label>
        <input
          className="w-full h-10 rounded bg-night text-cream px-3 text-sm focus:outline-none focus:ring-2 focus:ring-auburn"
          placeholder={defaultTripName(locations)}
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
        />
      </div>

      {/* Compare vs route toggle */}
      {locations.length > 1 && (
        <div className="flex flex-col gap-2 bg-night rounded p-3">
          <div className="text-cream text-sm font-semibold mb-1">
            How are these destinations related?
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="mode"
              checked={!routeMode}
              onChange={() => setRouteMode(false)}
              className="mt-1 accent-auburn"
            />
            <div>
              <div className="text-cream text-sm font-medium">
                Comparing destinations
              </div>
              <div className="text-ashgray text-xs">
                We haven't decided where to go yet — show weather and distance
                for each so we can pick one.
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group mt-1">
            <input
              type="radio"
              name="mode"
              checked={routeMode}
              onChange={() => setRouteMode(true)}
              className="mt-1 accent-auburn"
            />
            <div>
              <div className="text-cream text-sm font-medium">
                Planned route — visiting in order
              </div>
              <div className="text-ashgray text-xs">
                We're going to all of these. Drag destinations below into the
                order we'll visit them.
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Destination list */}
      <div className="flex flex-col gap-2">
        <div className="text-night font-semibold text-sm">
          Destinations
          {routeMode && (
            <span className="text-ashgray font-normal ml-2 text-xs">
              (drag to reorder)
            </span>
          )}
        </div>
        {locations.length === 0 ? (
          <div className="text-ashgray text-sm">
            No destinations left —{" "}
            <button className="underline" onClick={onBack}>
              go back
            </button>{" "}
            to add some.
          </div>
        ) : (
          <ReorderableList
            items={locations}
            onReorder={setLocations}
            onRemove={removeLocation}
          />
        )}
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {/* Actions */}
      <div className="flex gap-3 justify-between mt-2">
        <button className="text-night text-sm underline" onClick={onBack}>
          ← Back
        </button>
        <button
          className="bg-auburn text-cream px-5 py-2 rounded text-sm font-semibold disabled:opacity-50"
          disabled={locations.length === 0 || saving}
          onClick={handleCreate}
        >
          {saving ? "Creating trip…" : "Create Trip →"}
        </button>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultTripName(locations: PendingDestination[]): string {
  if (locations.length === 0) return "My Trip";
  if (locations.length === 1) return locations[0].name;
  return `${locations[0].name} + ${locations.length - 1} more`;
}

export default TripSetup;
