class TripInvitation < ApplicationRecord
    belongs_to :trip
    belongs_to :user, class_name: 'User', foreign_key: 'issuer_id'
    belongs_to :user, class_name: 'User', foreign_key: 'invitee_id'
end