class UserSkill < ApplicationRecord
  belongs_to :user
  belongs_to :skill

  enum :proficiency, { competent: 0, rusty: 1, learning: 2 }

  validates :user_id, uniqueness: { scope: :skill_id }
end
