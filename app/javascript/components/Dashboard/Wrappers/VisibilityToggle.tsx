import React from "react";

export const VISIBILITY_TIERS = ["public", "friends", "app_only"] as const;

export const VISIBILITY_LABELS: Record<string, string> = {
  public: "Public",
  friends: "Friends only",
  app_only: "Only me",
};

interface VisibilityToggleProps {
  field: string;
  value: string;
  onChange: (field: string, tier: string) => void;
}

// Three-way visibility selector shown next to a profile field in Edit mode.
const VisibilityToggle = ({
  field,
  value,
  onChange,
}: VisibilityToggleProps) => {
  return (
    <select
      aria-label={`${field} visibility`}
      className="h-8 text-sm ml-2 bg-cream text-night rounded-md px-1 cursor-pointer"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
    >
      {VISIBILITY_TIERS.map((tier) => (
        <option key={tier} value={tier}>
          {VISIBILITY_LABELS[tier]}
        </option>
      ))}
    </select>
  );
};

export default VisibilityToggle;
