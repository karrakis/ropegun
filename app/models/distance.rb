class Distance < ApplicationRecord
    has_many :addresses
    validates :origin, presence: true
    validates :destination, presence: true
    
    def calculate
        # okay, so we need to make a call to the google maps API to get the distance between the two points
        # this method should be called if self.get_distance returns nil
        # puts "GOOGLE API KEY: #{ENV['GOOGLE_MAPS_API_KEY']}"
        # Net::HTTP.start('maps.googleapis.com') do |http|
        #     puts "ORIGIN: #{origin}"
        #     p "DESTINATION: #{destination}"
        #     p "KEY: #{ENV['GOOGLE_MAPS_API_KEY']}"
        #     p "URL: /maps/api/distancematrix/json?units=imperial&origins=#{origin}&destinations=#{destination}&key=#{ENV['GOOGLE_MAPS_API_KEY']}"
        #     response = http.get("/maps/api/distancematrix/json?units=imperial&origins=#{origin}&destinations=#{destination}&key=#{ENV['GOOGLE_MAPS_API_KEY']}")
        #     puts "RESPONSE: #{response.body}"
        #     return response.body
        # end


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
