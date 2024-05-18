class Distance < ApplicationRecord
    has_many :addresses
    validates :origin, presence: true
    validates :destination, presence: true
    
    def calculate
        uri = URI("https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=#{origin}&destinations=#{destination}&key=#{ENV['GOOGLE_MAPS_API_KEY']}")
        res = Net::HTTP.get_response(uri)
        return JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)
    end

    def self.get_distance
        if self.find_by(origin: origin, destination: destination)
          return { distance: distance, origin: origin, destination: destination, duration: duration }
        else
            nil
        end
    end
        
end
