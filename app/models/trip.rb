class Trip < ApplicationRecord
  belongs_to :owner, class_name: "User", foreign_key: :owner_id

  # ── Soft delete ───────────────────────────────────────────────────────────
  # Archived trips are hidden from all normal lookups (including the public
  # share link) but retained for history rather than hard-deleted.
  default_scope { where(archived_at: nil) }
  scope :archived, -> { unscope(where: :archived_at).where.not(archived_at: nil) }

  # ── Locations ────────────────────────────────────────────────────────────────
  # Note: order by trips_locations.position is applied in queries that JOIN the
  # join table (e.g. .joins(:locations).order(...)). Not applied here because
  # it breaks eager loading via includes.
  has_and_belongs_to_many :locations, join_table: :trips_locations

  # ── Memberships ───────────────────────────────────────────────────────────
  has_many :trip_memberships, dependent: :destroy
  has_many :members, through: :trip_memberships, source: :user

  # ── Skills & Gear committed to this trip ─────────────────────────────────
  has_many :trip_skills, dependent: :destroy
  has_many :trip_gear_items, dependent: :destroy

  # ── Legacy — keep until trip_invitations controller is refactored ─────────
  has_many :trip_invitations, dependent: :destroy

  before_create :ensure_owner_membership

  def archived?
    archived_at.present?
  end

  def archive!
    update!(archived_at: Time.current)
  end

  private

  def ensure_owner_membership
    trip_memberships.build(user_id: owner_id, role: :owner, accepted: true, joined_at: Time.current)
  end
end
