class Trip < ApplicationRecord
    belongs_to :user, foreign_key: :owner_id
    has_many :users
    has_and_belongs_to_many :locations, join_table: :trips_locations
end
