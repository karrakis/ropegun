import React, { useState } from "react";
import { csrfToken } from "../../../utilities/csrfToken";

interface DiscussTabProps {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
  onTripUpdated: (trip: any) => void;
}

export const DiscussTab: React.FC<DiscussTabProps> = ({
  trip,
  localUser,
  isOrganizer,
  onTripUpdated,
}) => {
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const comments: any[] = trip.trip_comments ?? [];
  const sorted = [...comments].sort(
    (a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const post = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/trips/${trip.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({ body: trimmed }),
      });
      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error ?? `Server error ${res.status}`);
      }
      onTripUpdated(await res.json());
      setBody("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  };

  const remove = async (commentId: number) => {
    setRemovingId(commentId);
    try {
      const res = await fetch(`/api/v1/trip_comments/${commentId}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrfToken() },
      });
      if (res.ok) onTripUpdated(await res.json());
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-col gap-3">
        {sorted.length === 0 && (
          <p className="text-ashgray text-sm">No comments yet.</p>
        )}

        {sorted.map((comment: any) => {
          const canRemove = comment.user?.id === localUser.id || isOrganizer;
          return (
            <div key={comment.id} className="bg-night rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-cream text-sm font-medium">
                  {comment.user?.name}
                </span>
                {canRemove && (
                  <button
                    className="text-xs text-auburn underline disabled:opacity-50"
                    disabled={removingId === comment.id}
                    onClick={() => remove(comment.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-ashgray text-sm whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sticky so the composer stays reachable no matter how long the
          thread gets — it shouldn't require scrolling past every comment
          to post a new one. Extra bottom padding clears the fixed
          "+ New trip" button (bottom-4 right-4) rendered on top of this
          screen in TripPlan.tsx, which otherwise sits directly over the
          Post button and swallows its clicks. */}
      <div className="sticky bottom-0 bg-cream px-4 pt-2 pb-20 border-t border-ashgray border-opacity-20 flex flex-col gap-2">
        <textarea
          className="w-full rounded bg-night text-cream text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-auburn"
          rows={2}
          placeholder="Add a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          className="self-end bg-auburn text-cream text-xs px-3 py-1.5 rounded disabled:opacity-50"
          disabled={posting || !body.trim()}
          onClick={post}
        >
          Post
        </button>
      </div>
    </div>
  );
};
