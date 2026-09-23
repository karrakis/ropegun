class Location < ApplicationRecord
  has_and_belongs_to_many :trips, join_table: :trips_locations

  WEATHER_TTL = 24.hours

  def weather_stale?
    weather_last_updated.nil? || weather_last_updated < WEATHER_TTL.ago
  end
end
