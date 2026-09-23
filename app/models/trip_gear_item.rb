class TripGearItem < ApplicationRecord
  belongs_to :trip
  belongs_to :user
  belongs_to :gear_item

  validates :gear_item_id, uniqueness: { scope: [:trip_id, :user_id] }
  validates :quantity, numericality: { greater_than: 0 }
end
