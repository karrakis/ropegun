class User < ApplicationRecord
  # ── Trip relationships ────────────────────────────────────────────────────
  has_many :owned_trips, class_name: "Trip", foreign_key: "owner_id", dependent: :destroy
  has_many :trip_memberships, dependent: :destroy
  has_many :trips, through: :trip_memberships

  # ── Friendships ───────────────────────────────────────────────────────────
  has_many :friendships, class_name: "Friendship", foreign_key: "user_id"
  has_many :inverse_friendships, class_name: "Friendship", foreign_key: "friend_id"

  # ── Skills & Gear ─────────────────────────────────────────────────────────
  has_many :user_skills, dependent: :destroy
  has_many :skills, through: :user_skills
  has_many :user_gear_items, dependent: :destroy
  has_many :gear_items, through: :user_gear_items

  # ── Trip contributions ────────────────────────────────────────────────────
  has_many :trip_skills, dependent: :destroy
  has_many :trip_gear_items, dependent: :destroy

  validates :email, presence: true

  # ── Field-level profile visibility ───────────────────────────────────────
  # Three tiers, checked from least to most trusted viewer:
  #   "public"    — visible to anyone, including on a public trip share link
  #   "friends"   — visible only to accepted friends (and, for the fields
  #                 embedded in trip payloads, to fellow trip members —
  #                 being on a trip together is treated as friend-level
  #                 trust for that context, see Trip#serialize_for)
  #   "app_only"  — never rendered to another user, usable by the app itself
  PROFILE_FIELDS = %w[email about_me additional_information home_address].freeze
  VISIBILITY_TIERS = %w[public friends app_only].freeze
  DEFAULT_VISIBILITY = {
    "email" => "friends",
    "about_me" => "public",
    "additional_information" => "friends",
    "home_address" => "app_only"
  }.freeze

  # Sanitize on assignment (rather than trusting every caller to pre-filter)
  # so this is the single place invalid field names/tiers get dropped —
  # string keys only, to avoid the symbol/string jsonb-key bug this codebase
  # has hit before.
  def profile_visibility=(value)
    sanitized = (value || {}).each_with_object({}) do |(field, tier), acc|
      field = field.to_s
      tier = tier.to_s
      acc[field] = tier if PROFILE_FIELDS.include?(field) && VISIBILITY_TIERS.include?(tier)
    end
    super(sanitized)
  end

  def visibility_for(field)
    field = field.to_s
    (profile_visibility || {})[field] || DEFAULT_VISIBILITY.fetch(field, "public")
  end

  def friends_with?(other)
    return false unless other && other.id != id
    Friendship.accepted.exists?(user_id: id, friend_id: other.id) ||
      Friendship.accepted.exists?(user_id: other.id, friend_id: id)
  end

  # Viewer-scoped serialization, reused everywhere another user's profile
  # is rendered (trip payloads via Trip#serialize_for, the profile show
  # endpoint, and eventually Phase 5 search results).
  #
  #   as: :self   — the user viewing their own profile: everything, plus
  #                 the raw visibility map itself so an edit UI can render it
  #   as: :friend — an accepted friend (or, per the trip-context note
  #                 above, a fellow trip member): "public" + "friends" tier
  #                 fields, never "app_only"
  #   as: :public — anyone else (default): "public" tier fields only
  def profile_json(as: :public)
    data = { "id" => id, "uuid" => uuid, "name" => name }
    PROFILE_FIELDS.each do |field|
      tier = visibility_for(field)
      visible = case as
                when :self then true
                when :friend then tier != "app_only"
                else tier == "public"
                end
      data[field] = public_send(field) if visible
    end
    data["profile_visibility"] = (profile_visibility || {}) if as == :self
    data
  end
end

