class Trip < ApplicationRecord
    belongs_to :user, foreign_key: :owner_id
    alias_attribute :owner, :user
    has_many :users
    has_and_belongs_to_many :locations, join_table: :trips_locations
    has_many :trip_invitations
end
