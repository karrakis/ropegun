import React from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

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
//
// Deliberately not a native <select>: on mobile, browsers render <select>
// popups using their own OS-styled overlay (a centered dialog on Android, a
// bottom sheet wheel on iOS) that clash with the site's theme, vary wildly
// by device, and cover the whole screen. This renders our own anchored
// dropdown panel instead, so it always looks the same and only takes up the
// space right below the button.
const VisibilityToggle = ({
  field,
  value,
  onChange,
}: VisibilityToggleProps) => {
  return (
    <Listbox value={value} onChange={(tier) => onChange(field, tier)}>
      <div className="relative inline-block ml-2">
        <ListboxButton
          aria-label={`${field} visibility`}
          className="h-9 min-w-[9rem] text-sm bg-cream text-night rounded-md pl-3 pr-7 cursor-pointer text-left relative data-[open]:ring-2 data-[open]:ring-khaki"
        >
          {VISIBILITY_LABELS[value] ?? value}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-night text-xs"
          >
            ▾
          </span>
        </ListboxButton>
        <ListboxOptions
          className="absolute right-0 z-50 mt-1 w-full min-w-[9rem] rounded-md bg-night border border-ashgray border-opacity-30 shadow-lg py-1"
        >
          {VISIBILITY_TIERS.map((tier) => (
            <ListboxOption
              key={tier}
              value={tier}
              className="cursor-pointer select-none px-3 py-2.5 text-sm text-cream data-[focus]:bg-cream data-[focus]:bg-opacity-10 data-[selected]:text-khaki"
            >
              {VISIBILITY_LABELS[tier]}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
};

export default VisibilityToggle;
