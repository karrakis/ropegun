class User < ApplicationRecord
    has_and_belongs_to_many :trips, join_table: :trips_users
    has_many :owned_trips, class_name: "Trip", foreign_key: "owner_id"

    has_many :friendships, class_name: "Friendship", foreign_key: "user_id"
    has_many :inverse_friendships, class_name: "Friendship", foreign_key: "friend_id"

    has_many :trip_invites_received, class_name: "TripInvitation", foreign_key: "invitee_id"
    has_many :trip_invites_issued, class_name: "TripInvitation", foreign_key: "issuer_id"
    
    enum :top_rope_belay => [:no, :yes, :rusty], _prefix: :top_rope_belay
    enum :lead_belay => [:no, :yes, :rusty], _prefix: :lead_belay
    enum :trad_lead => [:no, :yes, :rusty], _prefix: :trad_lead
    enum :multipitch => [:no, :yes, :rusty], _prefix: :multipitch
    validates :email, presence: true
end
