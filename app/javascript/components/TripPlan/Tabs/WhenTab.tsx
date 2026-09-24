import React, { useState } from "react";
import { csrfToken } from "../../../utilities/csrfToken";

interface WhenTabProps {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
  updateTrip: (changes: Record<string, any>) => Promise<any>;
}

// ─── When-is-good calendar ────────────────────────────────────────────────────

const WhenIsGood = ({
  trip,
  localUser,
  updateTrip,
  locked,
}: {
  trip: any;
  localUser: any;
  updateTrip: (changes: Record<string, any>) => Promise<any>;
  locked: boolean;
}) => {
  const availability: Record<string, string[]> =
    trip.extra_data?.availability ?? {};
  const myDates: string[] = availability[localUser.id] ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month navigation state — default to current month
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    undefined,
    {
      month: "long",
      year: "numeric",
    },
  );
  const prevLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString(
    undefined,
    { month: "short" },
  );
  const nextLabel = new Date(viewYear, viewMonth + 1, 1).toLocaleDateString(
    undefined,
    { month: "short" },
  );

  // Build grid: full weeks covering the selected month
  const monthStart = new Date(viewYear, viewMonth, 1);
  const monthEnd = new Date(viewYear, viewMonth + 1, 0);
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const countFor = (d: Date) => {
    const key = fmt(d);
    return Object.values(availability).filter((dates) => dates.includes(key))
      .length;
  };

  const totalMembers =
    trip.trip_memberships?.filter((m: any) => m.accepted).length ?? 1;

  const toggle = async (d: Date) => {
    if (locked) return;
    const key = fmt(d);
    const next = myDates.includes(key)
      ? myDates.filter((x) => x !== key)
      : [...myDates, key];
    await updateTrip({
      extra_data: {
        ...trip.extra_data,
        availability: { ...availability, [localUser.id]: next },
      },
    });
  };

  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="p-4">
      <p className="text-ashgray text-xs mb-3">
        {locked
          ? "Dates have been set. Availability is shown for reference."
          : "Tap days you can attend. Darker = more people available."}
      </p>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="text-cream text-sm px-2 py-1 bg-night rounded"
        >
          ← {prevLabel}
        </button>
        <span className="text-night font-semibold text-sm">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="text-cream text-sm px-2 py-1 bg-night rounded"
        >
          {nextLabel} →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-ashgray text-xs pb-1">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const key = fmt(d);
          const count = countFor(d);
          const mine = myDates.includes(key);
          const isPast = d < today;
          const isOtherMonth = d.getMonth() !== viewMonth;
          const intensity = totalMembers > 0 ? count / totalMembers : 0;

          return (
            <button
              key={key}
              onClick={() => toggle(d)}
              disabled={isPast || locked || isOtherMonth}
              className={`rounded text-xs py-1 transition-colors ${
                isPast || isOtherMonth
                  ? "text-ashgray opacity-30 cursor-default"
                  : locked
                    ? "cursor-default"
                    : "cursor-pointer"
              } ${mine ? "ring-2 ring-auburn" : ""}`}
              style={{
                backgroundColor:
                  count > 0
                    ? `rgba(165, 36, 34, ${0.15 + intensity * 0.7})`
                    : "rgba(8, 15, 15, 0.4)",
                color: count > 0 ? "#EFF2C0" : "#A4BAB7",
              }}
              title={`${count} available`}
            >
              <div>{d.getDate()}</div>
              {count > 0 && <div style={{ fontSize: "9px" }}>{count}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Date picker (organizer sets dates) ──────────────────────────────────────

const DatePicker = ({
  trip,
  updateTrip,
}: {
  trip: any;
  updateTrip: (changes: Record<string, any>) => Promise<any>;
}) => {
  const [startsOn, setStartsOn] = useState(trip.starts_on ?? "");
  const [endsOn, setEndsOn] = useState(trip.ends_on ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateTrip({ starts_on: startsOn, ends_on: endsOn });
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setSaving(true);
    try {
      await updateTrip({ starts_on: null, ends_on: null });
      setStartsOn("");
      setEndsOn("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-night rounded mx-4 mt-4">
      <h3 className="text-cream font-semibold text-sm">Set trip dates</h3>
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-ashgray text-xs">Start</label>
          <input
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            className="rounded bg-cream text-night px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-ashgray text-xs">End</label>
          <input
            type="date"
            value={endsOn}
            min={startsOn}
            onChange={(e) => setEndsOn(e.target.value)}
            className="rounded bg-cream text-night px-2 py-1 text-sm"
          />
        </div>
        <div className="flex gap-2 items-end">
          <button
            className="bg-auburn text-cream px-3 py-1.5 rounded text-sm disabled:opacity-50 mt-4"
            onClick={save}
            disabled={saving || !startsOn || !endsOn}
          >
            {saving ? "…" : "Set"}
          </button>
          {trip.starts_on && (
            <button
              className="text-ashgray text-xs underline mt-4"
              onClick={clear}
              disabled={saving}
            >
              Clear dates
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main When tab ────────────────────────────────────────────────────────────

export const WhenTab: React.FC<WhenTabProps> = ({
  trip,
  localUser,
  isOrganizer,
  updateTrip,
}) => {
  const datesSet = !!(trip.starts_on && trip.ends_on);

  return (
    <div className="flex flex-col">
      {/* Confirmed dates banner */}
      {datesSet && (
        <div className="bg-auburn text-cream px-4 py-3 text-center">
          <div className="font-semibold">
            {new Date(trip.starts_on).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {" — "}
            {new Date(trip.ends_on).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-xs opacity-80 mt-0.5">Trip dates confirmed</div>
        </div>
      )}

      {/* Organizer date picker */}
      {isOrganizer && <DatePicker trip={trip} updateTrip={updateTrip} />}

      {/* When-is-good calendar */}
      <div className={datesSet ? "opacity-60 mt-2" : ""}>
        {datesSet && (
          <p className="text-ashgray text-xs px-4 pt-3">
            Availability (for reference)
          </p>
        )}
        <WhenIsGood
          trip={trip}
          localUser={localUser}
          updateTrip={updateTrip}
          locked={datesSet}
        />
      </div>
    </div>
  );
};
