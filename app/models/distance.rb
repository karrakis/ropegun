class Distance < ApplicationRecord
    has_many :addresses
    validates :origin, presence: true
    validates :destination, presence: true
    
    def calculate
        # okay, so we need to make a call to the google maps API to get the distance between the two points
        # this method should be called if self.get_distance returns nil

        # this is the URL we need to hit:
        # https://maps.googleapis.com/maps/api/distancematrix/json?origins=Seattle&destinations=San+Franc

        # we need to replace Seattle and San+Francisco with the origin and destination

        fetch("https://maps.googleapis.com/maps/api/distancematrix/json?origins=#{origin}&destinations=#{destination}&key=#{ENV['GOOGLE_MAPS_API_KEY']}").then(response => response.json()).then(data => {
            Distance.find_or_create_by(origin: origin, destination: destination).update(distance: data.rows[0].elements[0].distance.text, duration: data.rows[0].elements[0].duration.text)
        })
    end

    def self.get_distance
        if self.find_by(origin: origin, destination: destination)
          render json: { distance: distance, origin: origin, destination: destination, duration: duration}
        else
            nil
        end
    end
        
end
