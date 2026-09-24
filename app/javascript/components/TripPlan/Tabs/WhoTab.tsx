import React, { useState } from "react";
import { csrfToken } from "../../../utilities/csrfToken";

interface WhoTabProps {
  trip: any;
  localUser: any;
  isOrganizer: boolean;
  onTripUpdated: (trip: any) => void;
}

// ─── Invite form ──────────────────────────────────────────────────────────────

const InviteForm = ({
  trip,
  localUser,
  onTripUpdated,
}: {
  trip: any;
  localUser: any;
  onTripUpdated: (trip: any) => void;
}) => {
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find matching friends not already on the trip
  const memberIds = new Set(trip.trip_memberships?.map((m: any) => m.user?.id));
  const candidates = (localUser.friendships ?? []).filter(
    (f: any) =>
      !memberIds.has(f.id) &&
      (f.name?.toLowerCase().includes(query.toLowerCase()) ||
        f.email?.toLowerCase().includes(query.toLowerCase())),
  );

  const invite = async (friendUuid: string) => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/trip_memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({
          trip_membership: {
            trip_id: trip.id,
            invitee_uuid: friendUuid,
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      const updated = await res.json();
      onTripUpdated(updated);
      setQuery("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 border-t border-ashgray border-opacity-20">
      <h3 className="text-night font-semibold text-sm mb-2">Invite a friend</h3>
      <input
        className="w-full h-9 rounded bg-night text-cream px-3 text-sm focus:outline-none focus:ring-2 focus:ring-auburn mb-2"
        placeholder="Search friends by name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.length > 0 && candidates.length === 0 && (
        <p className="text-ashgray text-xs">No matching friends found.</p>
      )}
      {candidates.map((f: any) => (
        <div
          key={f.uuid}
          className="flex items-center justify-between py-1.5 border-b border-ashgray border-opacity-10 last:border-0"
        >
          <div>
            <span className="text-night text-sm">{f.name}</span>
            <span className="text-ashgray text-xs ml-2">{f.email}</span>
          </div>
          <button
            className="bg-auburn text-cream text-xs px-3 py-1 rounded disabled:opacity-50"
            disabled={sending}
            onClick={() => invite(f.uuid)}
          >
            Invite
          </button>
        </div>
      ))}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ─── Share link ───────────────────────────────────────────────────────────────

const ShareLink = ({ trip }: { trip: any }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/trips/${trip.share_token}`;
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="p-4 border-t border-ashgray border-opacity-20">
      <h3 className="text-night font-semibold text-sm mb-1">Share link</h3>
      <p className="text-ashgray text-xs mb-2">
        Anyone with this link can view the trip and add themselves as a guest.
      </p>
      <div className="flex gap-2 items-center">
        <input
          readOnly
          value={url}
          className="flex-1 h-8 rounded bg-night text-ashgray px-2 text-xs"
        />
        <button
          className="bg-auburn text-cream text-xs px-3 py-1.5 rounded shrink-0"
          onClick={copy}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

// ─── Member list ──────────────────────────────────────────────────────────────

export const WhoTab: React.FC<WhoTabProps> = ({
  trip,
  localUser,
  isOrganizer,
  onTripUpdated,
}) => {
  const [removing, setRemoving] = useState<number | null>(null);

  const memberships: any[] = trip.trip_memberships ?? [];
  const guestList: any[] = trip.guest_list ?? [];

  // Separate owner membership from others
  const ownerMembership = memberships.find((m: any) => m.role === "owner");
  const otherMemberships = memberships
    .filter((m: any) => m.role !== "owner")
    .sort((a: any, b: any) =>
      (a.user?.name ?? "").localeCompare(b.user?.name ?? ""),
    );

  // Anonymous guests sorted alphabetically
  const sortedGuests = [...guestList].sort((a: any, b: any) =>
    (a.name ?? "").localeCompare(b.name ?? ""),
  );

  const removeMembership = async (membershipId: number) => {
    setRemoving(membershipId);
    try {
      const res = await fetch(`/api/v1/trip_memberships/${membershipId}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrfToken() },
      });
      if (res.ok) onTripUpdated(await res.json());
    } finally {
      setRemoving(null);
    }
  };

  const removeGuest = async (guestName: string) => {
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
            remove_guest: guestName,
          },
        },
      }),
    });
    if (res.ok) onTripUpdated(await res.json());
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-col gap-2">
        {/* Organizer card */}
        {ownerMembership && (
          <div className="relative border border-ashgray rounded p-3 pt-4 mb-1">
            <span className="absolute -top-2.5 left-3 bg-cream text-ashgray text-xs px-1 uppercase tracking-widest">
              organizer
            </span>
            <span className="text-night font-semibold text-sm">
              {ownerMembership.user?.name ?? "—"}
            </span>
            <span className="text-ashgray text-xs ml-2">
              {ownerMembership.user?.email}
            </span>
          </div>
        )}

        {/* Other members */}
        {otherMemberships.map((m: any) => (
          <div
            key={m.id}
            className="flex items-center justify-between py-2 border-b border-ashgray border-opacity-20 last:border-0"
          >
            <div>
              <span className="text-night text-sm font-medium">
                {m.user?.name ?? "—"}
              </span>
              <span className="text-ashgray text-xs ml-2">{m.user?.email}</span>
              {m.role === "invited" && !m.accepted && (
                <span className="ml-2 text-xs text-auburn italic">invited</span>
              )}
            </div>
            {isOrganizer && (
              <button
                className="text-auburn text-xs underline disabled:opacity-50"
                disabled={removing === m.id}
                onClick={() => removeMembership(m.id)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {/* Anonymous guests */}
        {sortedGuests.map((g: any, i: number) => (
          <div
            key={`guest-${i}`}
            className="flex items-center justify-between py-2 border-b border-ashgray border-opacity-20 last:border-0"
          >
            <span className="text-night text-sm">{g.name}</span>
            {isOrganizer && (
              <button
                className="text-auburn text-xs underline"
                onClick={() => removeGuest(g.name)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {otherMemberships.length === 0 && sortedGuests.length === 0 && (
          <p className="text-ashgray text-sm">No other members yet.</p>
        )}
      </div>

      {isOrganizer && (
        <InviteForm
          trip={trip}
          localUser={localUser}
          onTripUpdated={onTripUpdated}
        />
      )}

      <ShareLink trip={trip} />
    </div>
  );
};
