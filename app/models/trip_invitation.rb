class TripInvitation < ApplicationRecord
    belongs_to :trip
    belongs_to :issuer, class_name: 'User', foreign_key: 'issuer_id'
    belongs_to :invitee, class_name: 'User', foreign_key: 'invitee_id'

    scope :pending, -> { where(accepted: false) }
end