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
end
