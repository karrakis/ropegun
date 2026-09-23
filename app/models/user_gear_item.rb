class UserGearItem < ApplicationRecord
  belongs_to :user
  belongs_to :gear_item

  validates :user_id, uniqueness: { scope: :gear_item_id }
  validates :quantity, numericality: { greater_than: 0 }
end
