class Trip < ApplicationRecord
    belongs_to :user
    has_many :users
    has_many :locations
end
