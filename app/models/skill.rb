class Skill < ApplicationRecord
  has_many :user_skills
  has_many :users, through: :user_skills
  has_many :trip_skills
end
