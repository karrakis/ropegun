class TripMembership < ApplicationRecord
  belongs_to :trip
  belongs_to :user

  enum :role, { owner: 0, member: 1, invited: 2 }

  validates :user_id, uniqueness: { scope: :trip_id }

  scope :accepted, -> { where(accepted: true) }
  scope :pending,  -> { where(accepted: false, role: :invited) }
  scope :members,  -> { where(accepted: true) }
end
