import React, { useState, useEffect } from "react";
import { csrfToken } from "../../../utilities/csrfToken";

interface WhatTabProps {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
  onTripUpdated: (trip: any) => void;
}

type WhatSubTab = "gear" | "skills";

// ─── Gear sub-tab ─────────────────────────────────────────────────────────────

const GearSubTab = ({
  trip,
  localUser,
  isOrganizer,
  onTripUpdated,
}: {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
  onTripUpdated: (trip: any) => void;
}) => {
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [showCatalogue, setShowCatalogue] = useState(false);

  useEffect(() => {
    fetch("/api/v1/gear_items", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then(setCatalogue);
  }, []);

  const tripGear: any[] = trip.trip_gear_items ?? [];
  const tripGearItemIds = new Set(tripGear.map((g: any) => g.gear_item_id));

  const addToTrip = async (gearItemId: number, required: number = 1) => {
    setAddingId(gearItemId);
    try {
      const res = await fetch(`/api/v1/trips/${trip.id}/gear_items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({
          gear_item_id: gearItemId,
          required_quantity: required,
        }),
      });
      if (res.ok) onTripUpdated(await res.json());
    } finally {
      setAddingId(null);
      setShowCatalogue(false);
    }
  };

  const commit = async (tripGearId: number, quantity: number) => {
    const res = await fetch(`/api/v1/trip_gear_items/${tripGearId}/commit`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ user_id: localUser.id, quantity }),
    });
    if (res.ok) onTripUpdated(await res.json());
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      {tripGear.length === 0 && (
        <p className="text-ashgray text-sm">No gear on this trip yet.</p>
      )}

      {tripGear.map((item: any) => {
        const committed = item.committed_quantity ?? 0;
        const required = item.required_quantity ?? 1;
        const covered = committed >= required;
        const myCommitment = item.commitments?.find(
          (c: any) => c.user_id === localUser.id,
        );

        return (
          <div key={item.id} className="bg-night rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cream text-sm font-medium">
                {item.gear_item?.name}
              </span>
              <div className="flex items-center gap-2">
                {/* Red: needed remaining */}
                <span
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                    covered
                      ? "bg-green-700 text-cream"
                      : "bg-red-700 text-cream"
                  }`}
                  title="Needed"
                >
                  {Math.max(0, required - committed)}
                </span>
                {/* Blue: committed */}
                <span
                  className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold bg-blue-700 text-cream"
                  title="Committed"
                >
                  {committed}
                </span>
              </div>
            </div>

            {/* Commit / uncommit */}
            {myCommitment ? (
              <button
                className="text-xs text-auburn underline"
                onClick={() => commit(item.id, 0)}
              >
                Withdraw ({myCommitment.quantity})
              </button>
            ) : (
              <button
                className="text-xs bg-auburn text-cream px-2 py-1 rounded"
                onClick={() => commit(item.id, 1)}
              >
                I'll bring this
              </button>
            )}

            {/* Commitments list */}
            {item.commitments?.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.commitments.map((c: any) => (
                  <span key={c.user_id} className="text-ashgray text-xs">
                    {c.user_name} ({c.quantity})
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Organizer: add from catalogue */}
      {isOrganizer && (
        <div className="mt-2">
          <button
            className="text-sm text-auburn underline"
            onClick={() => setShowCatalogue(!showCatalogue)}
          >
            {showCatalogue ? "Hide catalogue" : "+ Add gear from catalogue"}
          </button>
          {showCatalogue && (
            <div className="mt-2 flex flex-col gap-1 max-h-64 overflow-y-auto bg-night rounded p-2">
              {catalogue
                .filter((g) => !tripGearItemIds.has(g.id))
                .map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between py-1"
                  >
                    <div>
                      <span className="text-cream text-sm">{g.name}</span>
                      <span className="text-ashgray text-xs ml-2">
                        {g.category}
                      </span>
                    </div>
                    <button
                      className="text-xs bg-auburn text-cream px-2 py-0.5 rounded disabled:opacity-50"
                      disabled={addingId === g.id}
                      onClick={() => addToTrip(g.id)}
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Skills sub-tab ────────────────────────────────────────────────────────────

const SkillsSubTab = ({
  trip,
  localUser,
  isOrganizer,
  onTripUpdated,
}: {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
  onTripUpdated: (trip: any) => void;
}) => {
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [showCatalogue, setShowCatalogue] = useState(false);

  useEffect(() => {
    fetch("/api/v1/skills", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then(setCatalogue);
  }, []);

  const tripSkills: any[] = trip.trip_skills ?? [];
  const tripSkillIds = new Set(tripSkills.map((s: any) => s.skill_id));

  const addSkill = async (skillId: number) => {
    const res = await fetch(`/api/v1/trips/${trip.id}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ skill_id: skillId }),
    });
    if (res.ok) {
      onTripUpdated(await res.json());
      setShowCatalogue(false);
    }
  };

  const volunteer = async (tripSkillId: number) => {
    const res = await fetch(`/api/v1/trip_skills/${tripSkillId}/volunteer`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ user_id: localUser.id }),
    });
    if (res.ok) onTripUpdated(await res.json());
  };

  const unvolunteer = async (tripSkillId: number) => {
    const res = await fetch(`/api/v1/trip_skills/${tripSkillId}/unvolunteer`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ user_id: localUser.id }),
    });
    if (res.ok) onTripUpdated(await res.json());
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      {tripSkills.length === 0 && (
        <p className="text-ashgray text-sm">
          No skills listed for this trip yet.
        </p>
      )}

      {tripSkills.map((item: any) => {
        const volunteers: any[] = item.volunteers ?? [];
        const iVolunteered = volunteers.some(
          (v: any) => v.user_id === localUser.id,
        );

        return (
          <div key={item.id} className="bg-night rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-cream text-sm font-medium">
                {item.skill?.name}
              </span>
              {iVolunteered ? (
                <button
                  className="text-xs text-auburn underline"
                  onClick={() => unvolunteer(item.id)}
                >
                  Withdraw
                </button>
              ) : (
                <button
                  className="text-xs bg-auburn text-cream px-2 py-0.5 rounded"
                  onClick={() => volunteer(item.id)}
                >
                  I have this
                </button>
              )}
            </div>
            {volunteers.length > 0 && (
              <div className="text-ashgray text-xs">
                {volunteers.map((v: any) => v.user_name).join(", ")}
              </div>
            )}
          </div>
        );
      })}

      {isOrganizer && (
        <div className="mt-2">
          <button
            className="text-sm text-auburn underline"
            onClick={() => setShowCatalogue(!showCatalogue)}
          >
            {showCatalogue ? "Hide catalogue" : "+ Add skill from catalogue"}
          </button>
          {showCatalogue && (
            <div className="mt-2 flex flex-col gap-1 max-h-64 overflow-y-auto bg-night rounded p-2">
              {catalogue
                .filter((s) => !tripSkillIds.has(s.id))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1"
                  >
                    <div>
                      <span className="text-cream text-sm">{s.name}</span>
                      <span className="text-ashgray text-xs ml-2">
                        {s.category}
                      </span>
                    </div>
                    <button
                      className="text-xs bg-auburn text-cream px-2 py-0.5 rounded"
                      onClick={() => addSkill(s.id)}
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main What tab ────────────────────────────────────────────────────────────

export const WhatTab: React.FC<WhatTabProps> = ({
  trip,
  localUser,
  isOrganizer,
  onTripUpdated,
}) => {
  const [subTab, setSubTab] = useState<WhatSubTab>("gear");

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-ashgray bg-night bg-opacity-50 text-xs">
        {(["gear", "skills"] as WhatSubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-6 py-2 capitalize transition-colors ${
              subTab === t
                ? "text-cream border-b-2 border-auburn"
                : "text-ashgray hover:text-cream"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {subTab === "gear" && (
        <GearSubTab
          trip={trip}
          localUser={localUser}
          isOrganizer={isOrganizer}
          onTripUpdated={onTripUpdated}
        />
      )}
      {subTab === "skills" && (
        <SkillsSubTab
          trip={trip}
          localUser={localUser}
          isOrganizer={isOrganizer}
          onTripUpdated={onTripUpdated}
        />
      )}
    </div>
  );
};
