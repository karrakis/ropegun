import React, { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface UserProfileModalProps {
  // The uuid ("friendship key") of the user to view, or null to keep the
  // modal closed. Kept as a prop rather than local state in the caller so
  // multiple clickable names can share one modal instance.
  uuid: string | null;
  onClose: () => void;
}

interface ProfileData {
  id: number;
  uuid: string;
  name: string;
  email?: string;
  about_me?: string;
  additional_information?: string;
  home_address?: string;
}

// Read-only "visitor view" of another user's profile — reuses the same
// GET /api/v1/users/:uuid endpoint the friend-search results and trip
// payloads are built from (Api::V1::UsersController#show), which already
// filters fields by profile_visibility for the current viewer server-side.
// There's no edit affordance here at all, unlike Dashboard/ProfileForm.
export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  uuid,
  onClose,
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    setProfile(null);
    setError(null);
    setLoading(true);
    fetch(`/api/v1/users/${uuid}`, { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch(() => setError("Could not load this profile."))
      .finally(() => setLoading(false));
  }, [uuid]);

  return (
    <Dialog open={!!uuid} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-night bg-opacity-60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm bg-night text-cream rounded-lg p-6 flex flex-col gap-4">
          {loading && <p className="text-ashgray text-sm">Loading…</p>}
          {error && <p className="text-auburn text-sm">{error}</p>}
          {profile && !loading && !error && (
            <>
              <DialogTitle className="text-2xl font-semibold">
                {profile.name}
              </DialogTitle>
              <div className="flex flex-col gap-3">
                <ProfileRow label="Email" value={profile.email} />
                <ProfileRow label="About Me" value={profile.about_me} />
                <ProfileRow
                  label="Additional Information"
                  value={profile.additional_information}
                />
                <ProfileRow label="Home Address" value={profile.home_address} />
              </div>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-fit text-night h-9 px-4 bg-cream rounded-md self-end"
          >
            Close
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

const ProfileRow = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="flex flex-col gap-1">
      <span className="text-khaki text-sm">{label}</span>
      <span className="whitespace-pre-wrap text-sm">{value}</span>
    </div>
  ) : null;

export default UserProfileModal;
