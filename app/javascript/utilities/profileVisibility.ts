// Mirrors app/models/user.rb's PROFILE_FIELDS / DEFAULT_VISIBILITY — kept in
// sync manually since the frontend needs sensible defaults to render before
// a user has ever saved an explicit choice for a field.
export const PROFILE_FIELDS = [
  "email",
  "about_me",
  "additional_information",
  "home_address",
] as const;

export const DEFAULT_VISIBILITY: Record<string, string> = {
  email: "friends",
  about_me: "public",
  additional_information: "friends",
  home_address: "app_only",
};

export const visibilityFor = (
  profileVisibility: Record<string, string> | undefined | null,
  field: string,
): string => {
  return (
    (profileVisibility && profileVisibility[field]) ||
    DEFAULT_VISIBILITY[field] ||
    "public"
  );
};
