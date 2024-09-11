class Location < ApplicationRecord
    has_many :user_linked_locations
    has_many :users, through: :user_linked_locations
end
