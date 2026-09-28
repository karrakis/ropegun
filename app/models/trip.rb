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

  # ── Comment thread ────────────────────────────────────────────────────────
  has_many :trip_comments, dependent: :destroy

  # ── Legacy — keep until trip_invitations controller is refactored ─────────
  has_many :trip_invitations, dependent: :destroy

  before_create :ensure_owner_membership

  # ── Real-time sync ────────────────────────────────────────────────────────
  # Same include shape as Api::V1::TripsController#trip_include, kept as a
  # shared constant so every broadcast (and the initial `show` response the
  # frontend renders from) carries the same JSON shape.
  BROADCAST_INCLUDE = [
    :locations, :owner, { trip_memberships: { include: :user } },
    { trip_skills: { include: :skill, methods: [:volunteers] } },
    { trip_gear_items: { include: :gear_item, methods: [:commitments, :committed_quantity] } },
    { trip_comments: { include: :user } }
  ].freeze

  # Called from every controller action that mutates a trip or its
  # associated records (gear, skills, memberships) so everyone currently
  # viewing the trip gets the update without a manual reload.
  def broadcast_refresh!
    TripChannel.broadcast_to(self, reload.as_json(include: self.class::BROADCAST_INCLUDE))
  end

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
