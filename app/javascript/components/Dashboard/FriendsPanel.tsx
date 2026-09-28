import React, { useEffect, useState } from "react";
import { csrfToken } from "../../utilities/csrfToken";

interface FriendsPanelProps {
  localUser: any;
}

// Friends, friend requests (incoming/outgoing), and pending trip invitations.
// Kept separate from ProfileForm on purpose — these are social/relationship
// actions, not profile data, and mixing the two together was a big part of
// why the old page felt like a pile of unrelated sections.
//
// Each list starts from the values `components_controller.rb` computed at
// page load, then updates itself optimistically from here on — the old
// version called these endpoints and just console.log'd the response
// without ever touching component state, so the lists never visibly
// changed after clicking a button.
export const FriendsPanel = ({ localUser }: FriendsPanelProps) => {
  const [friendUuidInput, setFriendUuidInput] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>(localUser.friendships || []);
  const [incomingInvites, setIncomingInvites] = useState<any[]>(
    localUser.pending_friendship_invitations || [],
  );
  const [sentRequests, setSentRequests] = useState<any[]>(
    localUser.pending_friend_requests || [],
  );
  const [tripInvitations, setTripInvitations] = useState<any[]>(
    localUser.pending_trip_invitations || [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentToUuids, setSentToUuids] = useState<Set<string>>(new Set());

  // Debounced — fires ~350ms after the user stops typing, and ignores any
  // response that comes back after a newer query has already started
  // (cheaper than an AbortController for this low-stakes GET).
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/users/search?q=${encodeURIComponent(query)}`,
        );
        if (!cancelled && res.ok) {
          setSearchResults(await res.json());
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const friendshipRequest = (body: object, method: string) =>
    fetch("/friendships", {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ friendship: body }),
    });

  const sendFriendInvite = async () => {
    const uuid = friendUuidInput.trim();
    if (!uuid) return;
    setInviteError(null);
    const res = await friendshipRequest(
      { user_id: localUser.id, friend_uuid: uuid },
      "POST",
    );
    if (res.ok) {
      setSentRequests((prev) => [...prev, { uuid }]);
      setFriendUuidInput("");
    } else {
      setInviteError(
        "Couldn't send that invite — check the key and try again.",
      );
    }
  };

  const sendRequestToSearchResult = async (result: any) => {
    const res = await friendshipRequest(
      { user_id: localUser.id, friend_uuid: result.uuid },
      "POST",
    );
    if (res.ok) {
      setSentRequests((prev) => [...prev, { uuid: result.uuid }]);
      setSentToUuids((prev) => new Set(prev).add(result.uuid));
    }
  };

  const acceptInvite = async (invite: any) => {
    const res = await friendshipRequest(
      { user_id: localUser.id, friend_uuid: invite.uuid },
      "PATCH",
    );
    if (res.ok) {
      setIncomingInvites((prev) => prev.filter((i) => i.uuid !== invite.uuid));
      setFriends((prev) => [...prev, invite]);
    }
  };

  const rejectInvite = async (uuid: string) => {
    const res = await friendshipRequest(
      { user_id: localUser.id, friend_uuid: uuid },
      "DELETE",
    );
    if (res.ok) {
      setIncomingInvites((prev) => prev.filter((i) => i.uuid !== uuid));
    }
  };

  const cancelRequest = async (uuid: string) => {
    const res = await friendshipRequest(
      { user_id: localUser.id, friend_uuid: uuid },
      "DELETE",
    );
    if (res.ok) {
      setSentRequests((prev) => prev.filter((r) => r.uuid !== uuid));
    }
  };

  const acceptTripInvitation = async (membershipId: number) => {
    const res = await fetch(`/api/v1/trip_memberships/${membershipId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({ trip_membership: { action: "accept" } }),
    });
    if (res.ok) {
      setTripInvitations((prev) => prev.filter((i) => i.id !== membershipId));
    }
  };

  const declineTripInvitation = async (membershipId: number) => {
    const res = await fetch(`/api/v1/trip_memberships/${membershipId}`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": csrfToken() },
    });
    if (res.ok) {
      setTripInvitations((prev) => prev.filter((i) => i.id !== membershipId));
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 bg-khaki p-6 rounded-lg">
      <Section title="Find People">
        <input
          type="text"
          className="w-full h-9 bg-cream text-night p-2 rounded-md"
          placeholder="Search by name or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searching && (
          <p className="text-night text-sm italic opacity-70 mt-1">
            Searching…
          </p>
        )}
        {!searching &&
          searchQuery.trim().length >= 2 &&
          searchResults.length === 0 && (
            <EmptyState text="No matching discoverable users found." />
          )}
        {searchResults.length > 0 && (
          <ul className="flex flex-col gap-2 mt-2">
            {searchResults.map((result) => (
              <li
                key={result.uuid}
                className="flex items-center justify-between"
              >
                <span>{result.name}</span>
                <button
                  className="text-cream bg-auburn px-2 py-1 rounded-md text-sm disabled:opacity-50"
                  disabled={sentToUuids.has(result.uuid)}
                  onClick={() => sendRequestToSearchResult(result)}
                >
                  {sentToUuids.has(result.uuid) ? "Sent" : "Send Request"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Send a Friend Invite">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 h-9 bg-cream text-night p-2 rounded-md"
            placeholder="Friend's friendship key"
            value={friendUuidInput}
            onChange={(e) => setFriendUuidInput(e.target.value)}
          />
          <button
            onClick={sendFriendInvite}
            className="text-cream h-9 px-4 bg-auburn rounded-md"
          >
            Send
          </button>
        </div>
        {inviteError && (
          <p className="text-auburn text-sm mt-1">{inviteError}</p>
        )}
      </Section>

      <Section title="Invites From Others">
        {incomingInvites.length === 0 ? (
          <EmptyState text="No pending invites." />
        ) : (
          <ul className="flex flex-col gap-2">
            {incomingInvites.map((invite) => (
              <li
                key={invite.uuid}
                className="flex items-center justify-between"
              >
                <span>
                  {invite.name} ({invite.email})
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-night bg-cream px-2 py-1 rounded-md text-sm"
                    onClick={() => acceptInvite(invite)}
                  >
                    Accept
                  </button>
                  <button
                    className="text-cream bg-night px-2 py-1 rounded-md text-sm"
                    onClick={() => rejectInvite(invite.uuid)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Pending Requests You've Sent">
        {sentRequests.length === 0 ? (
          <EmptyState text="No outgoing requests." />
        ) : (
          <ul className="flex flex-col gap-2">
            {sentRequests.map((request) => (
              <li
                key={request.uuid}
                className="flex items-center justify-between"
              >
                <span className="text-sm">{request.uuid}</span>
                <button
                  className="text-cream bg-night px-2 py-1 rounded-md text-sm"
                  onClick={() => cancelRequest(request.uuid)}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Friends">
        {friends.length === 0 ? (
          <EmptyState text="No friends yet." />
        ) : (
          <ul className="flex flex-col gap-1">
            {friends.map((friend) => (
              <li key={friend.uuid}>
                {friend.name}
                {friend.email ? ` (${friend.email})` : ""}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Trip Invitations">
        {tripInvitations.length === 0 ? (
          <EmptyState text="No pending trip invitations." />
        ) : (
          <ul className="flex flex-col gap-2">
            {tripInvitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between"
              >
                <span>
                  {invitation.trip.name}
                  {invitation.issuer?.name
                    ? ` (from ${invitation.issuer.name})`
                    : ""}
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-night bg-cream px-2 py-1 rounded-md text-sm"
                    onClick={() => acceptTripInvitation(invitation.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="text-cream bg-night px-2 py-1 rounded-md text-sm"
                    onClick={() => declineTripInvitation(invitation.id)}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-night text-xl font-semibold">{title}</h3>
    {children}
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <p className="text-night text-sm italic opacity-70">{text}</p>
);

export default FriendsPanel;
