import React, { useState } from "react";
import { WhereTab } from "./Tabs/WhereTab";
import { WhenTab } from "./Tabs/WhenTab";
import { WhoTab } from "./Tabs/WhoTab";
import { WhatTab } from "./Tabs/WhatTab";
import { csrfToken } from "../../utilities/csrfToken";

type Tab = "where" | "when" | "who" | "what";

interface TripSummaryProps {
  trip: any;
  localUser: any;
  onTripUpdated: (trip: any) => void;
}

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: "where", label: "Where" },
  { id: "when", label: "When" },
  { id: "who", label: "Who" },
  { id: "what", label: "What" },
];

export const TripSummary: React.FC<TripSummaryProps> = ({
  trip,
  localUser,
  onTripUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("where");

  const isOrganizer = trip.owner?.id === localUser.id;

  const updateTrip = async (changes: Record<string, any>) => {
    const res = await fetch(`/api/v1/trips/${trip.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ trip: changes }),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const updated = await res.json();
    onTripUpdated(updated);
    return updated;
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Trip title bar */}
      <div className="bg-auburn text-cream px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold truncate">{trip.name}</h1>
        <span className="text-xs text-cream opacity-70 ml-2 shrink-0">
          {trip.route_mode
            ? "Route"
            : (trip.locations?.length ?? 0) > 1
              ? "Comparing"
              : null}
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-ashgray bg-night">
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? "text-cream border-b-2 border-auburn"
                : "text-ashgray hover:text-cream"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "where" && (
          <WhereTab
            trip={trip}
            localUser={localUser}
            isOrganizer={isOrganizer}
            onTripUpdated={onTripUpdated}
          />
        )}
        {activeTab === "when" && (
          <WhenTab
            trip={trip}
            localUser={localUser}
            isOrganizer={isOrganizer}
            updateTrip={updateTrip}
          />
        )}
        {activeTab === "who" && (
          <WhoTab
            trip={trip}
            localUser={localUser}
            isOrganizer={isOrganizer}
            onTripUpdated={onTripUpdated}
          />
        )}
        {activeTab === "what" && (
          <WhatTab
            trip={trip}
            localUser={localUser}
            isOrganizer={isOrganizer}
            onTripUpdated={onTripUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default TripSummary;
