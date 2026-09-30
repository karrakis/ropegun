import React, { useState } from "react";
import { csrfToken } from "../../utilities/csrfToken";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripSetupProps {
  localUser: { id: number; name: string };
  onTripCreated: (trip: any) => void;
  onBack: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

// Trip creation is just a name now — destinations are added afterward, from
// the Where tab of the trip editor (which a new trip lands on directly).
// Locations used to be picked on a map before the trip even existed, but
// that turned out to be a confusing first step; naming the trip and jumping
// straight into the editor is a much shorter path to somewhere useful.
export const TripSetup: React.FC<TripSetupProps> = ({
  localUser,
  onTripCreated,
  onBack,
}) => {
  const [tripName, setTripName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
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
            name: tripName.trim() || "My Trip",
            locations: [],
            route_mode: false,
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
      <div className="flex flex-col gap-1">
        <label htmlFor="trip-name" className="text-night font-semibold text-sm">
          Trip name
        </label>
        <input
          id="trip-name"
          className="w-full h-10 rounded bg-night text-cream px-3 text-sm focus:outline-none focus:ring-2 focus:ring-auburn"
          placeholder="My Trip"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          autoFocus
        />
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div className="flex gap-3 justify-between mt-2">
        <button className="text-night text-sm underline" onClick={onBack}>
          ← Back
        </button>
        <button
          className="bg-auburn text-cream px-5 py-2 rounded text-sm font-semibold disabled:opacity-50"
          disabled={saving}
          onClick={handleCreate}
        >
          {saving ? "Creating trip…" : "Create Trip →"}
        </button>
      </div>
    </div>
  );
};

export default TripSetup;
