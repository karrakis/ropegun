import React from "react";

interface BackCaretProps {
  onClick: () => void;
  label?: string;
}

// Thumb-friendly "one level up" control, meant to sit inline to the left of
// a screen's title text inside its title bar (not floating over content).
export const BackCaret = ({ onClick, label = "Back" }: BackCaretProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="flex items-center justify-center w-10 h-10 shrink-0 rounded bg-night text-cream active:bg-opacity-80"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>
);

export default BackCaret;
