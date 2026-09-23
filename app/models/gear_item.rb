class GearItem < ApplicationRecord
  has_many :user_gear_items
  has_many :users, through: :user_gear_items
  has_many :trip_gear_items
end
