class Trip < ApplicationRecord
  belongs_to :owner, class_name: "User", foreign_key: :owner_id

  # ── Locations (ordered by position) ──────────────────────────────────────
  has_and_belongs_to_many :locations, -> { order("trips_locations.position ASC") },
                           join_table: :trips_locations

  # ── Memberships ───────────────────────────────────────────────────────────
  has_many :trip_memberships, dependent: :destroy
  has_many :members, through: :trip_memberships, source: :user

  # ── Skills & Gear committed to this trip ─────────────────────────────────
  has_many :trip_skills, dependent: :destroy
  has_many :trip_gear_items, dependent: :destroy

  # ── Legacy — keep until trip_invitations controller is refactored ─────────
  has_many :trip_invitations, dependent: :destroy

  before_create :ensure_owner_membership

  private

  def ensure_owner_membership
    trip_memberships.build(user_id: owner_id, role: :owner, accepted: true, joined_at: Time.current)
  end
end
