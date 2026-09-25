class TripSkill < ApplicationRecord
  belongs_to :trip
  belongs_to :user
  belongs_to :skill

  validates :skill_id, uniqueness: { scope: [:trip_id, :user_id] }

  def volunteers
    extra_data&.fetch("volunteers", []) || []
  end
end
