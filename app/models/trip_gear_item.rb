class TripGearItem < ApplicationRecord
  belongs_to :trip
  belongs_to :user
  belongs_to :gear_item

  validates :gear_item_id, uniqueness: { scope: [:trip_id, :user_id] }
  validates :quantity, numericality: { greater_than_or_equal_to: 0 }
  validates :required_quantity, numericality: { greater_than: 0 }

  def commitments
    extra_data&.fetch("commitments", []) || []
  end

  def committed_quantity
    quantity
  end
end
