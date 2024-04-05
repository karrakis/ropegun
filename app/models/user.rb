class User < ApplicationRecord
    enum :top_rope_belay => [:no, :yes, :rusty], _prefix: :top_rope_belay
    enum :lead_belay => [:no, :yes, :rusty], _prefix: :lead_belay
    enum :trad_lead => [:no, :yes, :rusty], _prefix: :trad_lead
    enum :multipitch => [:no, :yes, :rusty], _prefix: :multipitch
    validates :email, presence: true
end
