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
  # Shared shape for every trip-mutating controller action and the
  # broadcast_refresh! payload below, so they can't drift out of sync — see
  # serialize_for, which builds on this and filters embedded users through
  # User#profile_json.
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
    TripChannel.broadcast_to(self, reload.serialize_for)
  end

  # The one place a Trip is turned into JSON — used by every controller
  # action that renders a trip and by broadcast_refresh! above, so the
  # shape (and the profile-visibility filtering below) can't drift between
  # call sites.
  #
  # Every embedded User (owner, trip_memberships.user, trip_comments.user)
  # is filtered through User#profile_json(as: :friend) rather than raw
  # as_json: being on a trip together is treated as friend-level trust for
  # that trip's own data, but a member's "app_only" fields (e.g. home
  # address) still never appear here regardless. This is the same
  # filtering for every viewer (not per-viewer), which is what makes it
  # safe to reuse for the single broadcast payload ActionCable sends to
  # every subscriber.
  def serialize_for
    data = as_json(include: self.class::BROADCAST_INCLUDE)

    users_by_id = ([owner] + trip_memberships.map(&:user) + trip_comments.map(&:user))
                  .compact.uniq(&:id).index_by(&:id)

    if data["owner"]
      data["owner"] = users_by_id[data["owner"]["id"]]&.profile_json(as: :friend)
    end
    data["trip_memberships"]&.each do |m|
      user = m["user"] && users_by_id[m["user"]["id"]]
      m["user"] = user.profile_json(as: :friend) if user
    end
    data["trip_comments"]&.each do |c|
      user = c["user"] && users_by_id[c["user"]["id"]]
      c["user"] = user.profile_json(as: :friend) if user
    end

    data
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
