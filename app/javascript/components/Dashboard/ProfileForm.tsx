import React, { useState } from "react";
import { csrfToken } from "../../utilities/csrfToken";
import VisibilityToggle from "./Wrappers/VisibilityToggle";
import { visibilityFor } from "../../utilities/profileVisibility";

interface ProfileFormProps {
  user: any; // Auth0 session claims: given_name, family_name, picture
  localUser: any; // DB user record, shaped like User#profile_json(as: :self)
  onSaved: (updated: any) => void;
}

// Profile fields (about_me / additional_information / home_address, plus
// read-only email), each paired with its own visibility selector. Renders
// read-only until "Edit" is clicked; Save only exits back to read-only mode
// once the PATCH actually succeeds (Cancel exits without saving). This
// replaces the old Display/Edit toggle, which had drifted into referencing
// climbing-grade columns removed from the users table years ago and whose
// Save button silently swallowed error responses and exited edit mode
// before the request even resolved.
export const ProfileForm = ({ user, localUser, onSaved }: ProfileFormProps) => {
  const [editing, setEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState(localUser.about_me || "");
  const [additionalInformation, setAdditionalInformation] = useState(
    localUser.additional_information || "",
  );
  const [homeAddress, setHomeAddress] = useState(localUser.home_address || "");
  const [profileVisibility, setProfileVisibility] = useState<
    Record<string, string>
  >(localUser.profile_visibility || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFieldVisibility = (field: string, tier: string) => {
    setProfileVisibility((prev) => ({ ...prev, [field]: tier }));
  };

  const startEditing = () => {
    setError(null);
    setAboutMe(localUser.about_me || "");
    setAdditionalInformation(localUser.additional_information || "");
    setHomeAddress(localUser.home_address || "");
    setProfileVisibility(localUser.profile_visibility || {});
    setEditing(true);
  };

  const cancelEditing = () => {
    setError(null);
    setEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/users/${localUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({
          user: {
            about_me: aboutMe,
            additional_information: additionalInformation,
            home_address: homeAddress,
            profile_visibility: profileVisibility,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message =
          data && typeof data === "object"
            ? Object.values(data).flat().join(", ")
            : "Could not save profile.";
        setError(message || "Could not save profile.");
        return;
      }
      onSaved(data);
      setEditing(false);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 bg-night text-cream p-6 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            className="w-20 h-20 rounded-full object-cover"
            alt="Profile"
            src={user?.picture}
          />
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.given_name} {user?.family_name}
            </h2>
            <p className="text-ashgray text-xs">
              Friendship key: {localUser.uuid}
            </p>
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="w-fit text-cream h-9 px-4 bg-auburn rounded-md"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <ProfileField
            label="Email"
            field="email"
            visibility={visibilityFor(profileVisibility, "email")}
            onVisibilityChange={setFieldVisibility}
          >
            <span className="text-lg">{localUser.email}</span>
          </ProfileField>

          <ProfileField
            label="About Me"
            field="about_me"
            visibility={visibilityFor(profileVisibility, "about_me")}
            onVisibilityChange={setFieldVisibility}
          >
            <textarea
              aria-label="About Me"
              className="w-full bg-cream text-night rounded-md p-2"
              rows={3}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
            />
          </ProfileField>

          <ProfileField
            label="Additional Information"
            field="additional_information"
            visibility={visibilityFor(
              profileVisibility,
              "additional_information",
            )}
            onVisibilityChange={setFieldVisibility}
          >
            <textarea
              aria-label="Additional Information"
              className="w-full bg-cream text-night rounded-md p-2"
              rows={3}
              value={additionalInformation}
              onChange={(e) => setAdditionalInformation(e.target.value)}
            />
          </ProfileField>

          <ProfileField
            label="Home Address"
            field="home_address"
            visibility={visibilityFor(profileVisibility, "home_address")}
            onVisibilityChange={setFieldVisibility}
          >
            <textarea
              aria-label="Home Address"
              className="w-full bg-cream text-night rounded-md p-2"
              rows={2}
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
            />
          </ProfileField>

          {error && (
            <p role="alert" className="text-auburn text-sm">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="w-fit text-cream h-9 px-4 bg-auburn rounded-md disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="w-fit text-night h-9 px-4 bg-cream rounded-md disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <ReadOnlyField label="Email" value={localUser.email} />
          <ReadOnlyField label="About Me" value={localUser.about_me} />
          <ReadOnlyField
            label="Additional Information"
            value={localUser.additional_information}
          />
          <ReadOnlyField label="Home Address" value={localUser.home_address} />
        </div>
      )}
    </div>
  );
};

interface ProfileFieldProps {
  label: string;
  field: string;
  visibility: string;
  onVisibilityChange: (field: string, tier: string) => void;
  children: React.ReactNode;
}

const ProfileField = ({
  label,
  field,
  visibility,
  onVisibilityChange,
  children,
}: ProfileFieldProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-khaki text-lg">{label}</span>
      <VisibilityToggle
        field={field}
        value={visibility}
        onChange={onVisibilityChange}
      />
    </div>
    {children}
  </div>
);

const ReadOnlyField = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-khaki text-lg">{label}</span>
    <span className="whitespace-pre-wrap">{value || "—"}</span>
  </div>
);

export default ProfileForm;
