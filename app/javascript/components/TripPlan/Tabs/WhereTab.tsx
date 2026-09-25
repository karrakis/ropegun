import React, { useState, useEffect } from "react";
import { csrfToken } from "../../../utilities/csrfToken";

type WhereSubTab = "locations" | "weather" | "distances" | "notes";

// ─── Weather fetch (via Rails cache layer) ────────────────────────────────────

interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  windMax: number;
}

async function fetchWeatherForLocation(
  locationId: number,
): Promise<DailyWeather[]> {
  const r = await fetch(`/api/v1/locations/${locationId}/weather`, {
    headers: { Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`Weather API ${r.status}`);
  const data = await r.json();
  return data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    precipProb: data.daily.precipitation_probability_max[i] ?? 0,
    windMax: Math.round(data.daily.windspeed_10m_max[i]),
  }));
}

// ─── Weather sub-tab ──────────────────────────────────────────────────────────

const WeatherSubTab = ({ locations }: { locations: any[] }) => {
  const [weatherByLoc, setWeatherByLoc] = useState<
    Record<number, DailyWeather[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locations.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(
      locations.map((loc) =>
        fetchWeatherForLocation(loc.id)
          .then((days) => ({ id: loc.id, days }))
          .catch(() => ({ id: loc.id, days: [] })),
      ),
    ).then((results) => {
      const map: Record<number, DailyWeather[]> = {};
      results.forEach(({ id, days }) => {
        map[id] = days;
      });
      setWeatherByLoc(map);
      setLoading(false);
    });
  }, [locations.map((l) => l.id).join(",")]);

  if (loading)
    return <p className="text-ashgray text-sm p-4">Loading forecast…</p>;
  if (error) return <p className="text-red-400 text-sm p-4">{error}</p>;

  return (
    <div className="p-4 flex flex-col gap-6">
      {locations.map((loc) => {
        const days = weatherByLoc[loc.id] ?? [];
        return (
          <div key={loc.id}>
            <h3 className="text-night font-semibold text-sm mb-2">
              {loc.name}
            </h3>
            {days.length === 0 ? (
              <p className="text-ashgray text-xs">No forecast available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse min-w-max">
                  <thead>
                    <tr className="bg-night text-ashgray">
                      <th className="px-2 py-1 text-left font-normal">Date</th>
                      <th className="px-2 py-1 text-right font-normal">High</th>
                      <th className="px-2 py-1 text-right font-normal">Low</th>
                      <th className="px-2 py-1 text-right font-normal">
                        Precip%
                      </th>
                      <th className="px-2 py-1 text-right font-normal">Wind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((d, i) => (
                      <tr
                        key={d.date}
                        className={`${i % 2 === 0 ? "bg-night bg-opacity-70" : "bg-night bg-opacity-60"}`}
                      >
                        <td className="px-2 py-1 text-ashgray">
                          {new Date(d.date + "T12:00:00").toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-2 py-1 text-right text-cream">
                          {d.tempMax}°
                        </td>
                        <td className="px-2 py-1 text-right text-ashgray">
                          {d.tempMin}°
                        </td>
                        <td
                          className={`px-2 py-1 text-right ${d.precipProb >= 60 ? "text-blue-400" : d.precipProb >= 30 ? "text-blue-300 opacity-70" : "text-ashgray"}`}
                        >
                          {d.precipProb}%
                        </td>
                        <td className="px-2 py-1 text-right text-ashgray">
                          {d.windMax} mph
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface WhereTabProps {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
  onTripUpdated: (trip: any) => void;
}

// ─── Distances sub-tab ────────────────────────────────────────────────────────

const DistancesSubTab = ({
  trip,
  localUser,
  isOrganizer,
}: {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
}) => {
  const [distances, setDistances] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistances = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/trips/${trip.id}/distances`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setDistances(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistances();
  }, [trip.id]);

  if (loading)
    return <p className="text-ashgray text-sm p-4">Calculating distances…</p>;
  if (error) return <p className="text-red-400 text-sm p-4">{error}</p>;
  if (!distances) return null;

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Average distance */}
      {distances.average && (
        <div className="bg-night rounded p-3">
          <h3 className="text-cream font-semibold text-sm mb-2">
            Average distance
          </h3>
          {trip.locations.map((loc: any) => {
            const avg = distances.average[loc.id];
            return avg ? (
              <div
                key={loc.id}
                className="flex justify-between text-sm py-1 border-b border-ashgray border-opacity-20 last:border-0"
              >
                <span className="text-cream">{loc.name}</span>
                <span className="text-ashgray">
                  {avg.distance} · {avg.duration}
                </span>
              </div>
            ) : null;
          })}
          {distances.missing_addresses > 0 && (
            <p className="text-ashgray text-xs mt-2">
              {distances.missing_addresses} member
              {distances.missing_addresses > 1 ? "s have" : " has"} not provided
              a home address.
            </p>
          )}
        </div>
      )}

      {/* Per-member breakdown — organizer only */}
      {isOrganizer && distances.per_member && (
        <div className="bg-night rounded p-3">
          <h3 className="text-cream font-semibold text-sm mb-2">
            Per-member distances
          </h3>
          {distances.per_member.map((member: any) => (
            <div key={member.user_id} className="mb-3">
              <div className="text-cream text-sm font-medium">
                {member.name}
              </div>
              {member.distances ? (
                trip.locations.map((loc: any) => {
                  const d = member.distances[loc.id];
                  return d ? (
                    <div
                      key={loc.id}
                      className="flex justify-between text-xs py-0.5 ml-3"
                    >
                      <span className="text-ashgray">{loc.name}</span>
                      <span className="text-ashgray">
                        {d.distance} · {d.duration}
                      </span>
                    </div>
                  ) : null;
                })
              ) : (
                <span className="text-ashgray text-xs ml-3">
                  No home address
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Notes sub-tab ────────────────────────────────────────────────────────────

const NotesSubTab = ({
  trip,
  locationId,
  isOrganizer,
  onTripUpdated,
}: {
  trip: any;
  locationId: number;
  isOrganizer: boolean;
  onTripUpdated: (trip: any) => void;
}) => {
  const existingNote = trip.extra_data?.notes?.[locationId] ?? "";
  const [note, setNote] = useState(existingNote);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/trips/${trip.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({
          trip: {
            extra_data: {
              ...trip.extra_data,
              notes: { ...(trip.extra_data?.notes ?? {}), [locationId]: note },
            },
          },
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      onTripUpdated(await res.json());
    } finally {
      setSaving(false);
    }
  };

  if (!isOrganizer) {
    return existingNote ? (
      <p className="p-4 text-night text-sm whitespace-pre-wrap">
        {existingNote}
      </p>
    ) : (
      <p className="p-4 text-ashgray text-sm italic">
        No notes for this location.
      </p>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      <textarea
        className="w-full min-h-32 rounded bg-night text-cream p-3 text-sm focus:outline-none focus:ring-2 focus:ring-auburn"
        placeholder="Add notes for this location — access info, cultural context, warnings…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button
        className="self-end bg-auburn text-cream px-4 py-1.5 rounded text-sm disabled:opacity-50"
        onClick={save}
        disabled={saving || note === existingNote}
      >
        {saving ? "Saving…" : "Save notes"}
      </button>
    </div>
  );
};

// ─── Main Where tab ───────────────────────────────────────────────────────────

export const WhereTab: React.FC<WhereTabProps> = ({
  trip,
  localUser,
  isOrganizer,
  onTripUpdated,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<any>(
    trip.locations?.[0] ?? null,
  );
  const [subTab, setSubTab] = useState<WhereSubTab>("locations");

  const locations: any[] = trip.locations ?? [];

  return (
    <div className="flex flex-col">
      {/* Location picker — shown when multiple locations */}
      {locations.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-cream bg-opacity-10">
          {locations.map((loc: any) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className={`shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                selectedLocation?.id === loc.id
                  ? "bg-auburn text-cream"
                  : "bg-night text-ashgray hover:text-cream"
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex border-b border-ashgray bg-night bg-opacity-50 text-xs">
        {(["locations", "weather", "distances", "notes"] as WhereSubTab[]).map(
          (t) => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-4 py-2 capitalize transition-colors ${
                subTab === t
                  ? "text-cream border-b-2 border-auburn"
                  : "text-ashgray hover:text-cream"
              }`}
            >
              {t === "locations"
                ? "Overview"
                : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ),
        )}
      </div>

      {/* Sub-tab content */}
      {subTab === "locations" && (
        <div className="p-4 flex flex-col gap-3">
          {locations.length === 0 && (
            <p className="text-ashgray text-sm">No locations on this trip.</p>
          )}
          {locations.map((loc: any) => (
            <div key={loc.id} className="bg-night rounded p-3 ">
              <div className="flex items-start justify-between">
                <div className="flex justify-between w-full">
                  <div className="flex flex-col">
                    <div className="text-cream font-semibold text-sm">
                      {loc.name}
                    </div>
                    <div className="text-ashgray text-xs mt-0.5">
                      {parseFloat(loc.latitude).toFixed(5)},{" "}
                      {parseFloat(loc.longitude).toFixed(5)}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center mt-1.5 text-xs bg-cream text-night px-2 py-0.5 rounded hover:opacity-80"
                  >
                    Directions ↗
                  </a>
                </div>
                {/* Compare-mode: organizer can choose this destination */}
                {isOrganizer && !trip.route_mode && locations.length > 1 && (
                  <button
                    className="text-xs bg-auburn text-cream px-2 py-1 rounded ml-3 shrink-0"
                    onClick={async () => {
                      if (
                        !confirm(
                          `Choose "${loc.name}" as the destination? Other locations will be removed.`,
                        )
                      )
                        return;
                      const res = await fetch(
                        `/api/v1/trips/${trip.id}/choose_destination`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": csrfToken(),
                          },
                          body: JSON.stringify({ location_id: loc.id }),
                        },
                      );
                      if (res.ok) onTripUpdated(await res.json());
                    }}
                  >
                    Choose
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "weather" && <WeatherSubTab locations={locations} />}

      {subTab === "distances" && (
        <DistancesSubTab
          trip={trip}
          localUser={localUser}
          isOrganizer={isOrganizer}
        />
      )}

      {subTab === "notes" && selectedLocation && (
        <NotesSubTab
          trip={trip}
          locationId={selectedLocation.id}
          isOrganizer={isOrganizer}
          onTripUpdated={onTripUpdated}
        />
      )}
    </div>
  );
};
