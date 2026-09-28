class TripComment < ApplicationRecord
  belongs_to :trip
  belongs_to :user

  validates :body, presence: true
end
