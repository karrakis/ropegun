import React, { useState, useEffect } from "react";

interface TripCardProps {
  trip: any;
  onOpen: (trip: any) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onOpen }) => {
  const [expanded, setExpanded] = useState(false);
  const locations: any[] = trip.locations ?? [];
  const dateStr = trip.starts_on
    ? `${fmtDate(trip.starts_on)}${trip.ends_on ? " – " + fmtDate(trip.ends_on) : ""}`
    : "Dates TBD";

  return (
    <div className="bg-night rounded overflow-hidden">
      {/* Header row — always visible */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-cream font-medium text-sm truncate">
            {trip.name || (
              <span className="italic text-ashgray">Unnamed trip</span>
            )}
          </div>
          <div className="text-ashgray text-xs">
            {dateStr}
            {locations.length > 0 && (
              <span className="ml-2 opacity-60">
                · {locations.map((l: any) => l.name).join(", ")}
              </span>
            )}
          </div>
        </div>
        <span
          className={`text-ashgray text-xs ml-3 shrink-0 transform transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
        >
          &#9660;
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-ashgray border-opacity-20 px-3 py-2 flex flex-col gap-1">
          {/* Destination list */}
          {locations.length > 0 ? (
            <ul className="flex flex-col gap-0.5 mb-2">
              {locations.map((loc: any) => (
                <li key={loc.id} className="text-ashgray text-xs">
                  <span className="text-cream">{loc.name}</span>
                  <span className="ml-1 opacity-60">
                    {parseFloat(loc.latitude).toFixed(4)},{" "}
                    {parseFloat(loc.longitude).toFixed(4)}
                    {loc.office ? ` · NWS ${loc.office}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ashgray text-xs mb-2">No locations saved.</p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-ashgray">
            <span>
              {trip.trip_memberships?.filter((m: any) => m.accepted).length ??
                1}{" "}
              member
              {(trip.trip_memberships?.filter((m: any) => m.accepted).length ??
                1) !== 1
                ? "s"
                : ""}
            </span>
          </div>

          <button
            className="mt-2 w-full bg-auburn text-cream text-sm py-1.5 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(trip);
            }}
          >
            Open trip →
          </button>
        </div>
      )}
    </div>
  );
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ExistingTripsProps {
  localUser: any;
  onTripSelected: (trip: any) => void;
}

export const ExistingTrips: React.FC<ExistingTripsProps> = ({
  localUser,
  onTripSelected,
}) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v1/trips", { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(`trips API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setTrips(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        console.error("ExistingTrips fetch failed:", e);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-ashgray text-sm p-4">Loading trips…</p>;
  if (trips.length === 0)
    return <p className="text-ashgray text-sm p-4">No trips yet.</p>;

  const showSearch = trips.length > 6;
  const filtered = search.trim()
    ? trips.filter((t) =>
        [t.name, ...(t.locations ?? []).map((l: any) => l.name)]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
    : trips;

  return (
    <div className="w-full flex flex-col gap-2 p-2">
      {showSearch && (
        <input
          className="w-full h-8 rounded bg-night text-cream px-3 text-sm focus:outline-none focus:ring-1 focus:ring-auburn"
          placeholder="Search trips…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      {filtered.length === 0 && (
        <p className="text-ashgray text-xs px-1">No trips match your search.</p>
      )}
      {filtered.map((trip) => (
        <TripCard key={trip.id} trip={trip} onOpen={onTripSelected} />
      ))}
    </div>
  );
};

export default ExistingTrips;
