class User < ApplicationRecord
    has_many :locations
    has_and_belongs_to_many :trips, join_table: :trips_users
    has_many :friendships, class_name: 'User', foreign_key: 'friend_id', join_table: :friends_users
    enum :top_rope_belay => [:no, :yes, :rusty], _prefix: :top_rope_belay
    enum :lead_belay => [:no, :yes, :rusty], _prefix: :lead_belay
    enum :trad_lead => [:no, :yes, :rusty], _prefix: :trad_lead
    enum :multipitch => [:no, :yes, :rusty], _prefix: :multipitch
    validates :email, presence: true
end
