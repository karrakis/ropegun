class Api::V1::LocationWeatherController < ApplicationController
  WEATHER_TTL = 1.hour

  def show
    @location = Location.find(params[:location_id])

    if @location.weather.present? &&
       @location.weather_last_updated.present? &&
       @location.weather_last_updated > WEATHER_TTL.ago

      render json: @location.weather
      return
    end

    # Fetch from Open-Meteo
    url = "https://api.open-meteo.com/v1/forecast" \
          "?latitude=#{@location.latitude}&longitude=#{@location.longitude}" \
          "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max" \
          "&forecast_days=16&temperature_unit=fahrenheit&wind_speed_unit=mph" \
          "&precipitation_unit=inch&timezone=auto"

    response = Net::HTTP.get_response(URI(url))

    unless response.is_a?(Net::HTTPSuccess)
      render json: { error: "Weather fetch failed: #{response.code}" }, status: :bad_gateway
      return
    end

    data = JSON.parse(response.body)

    @location.update!(
      weather: data,
      weather_source: "open-meteo",
      weather_last_updated: Time.current
    )

    render json: data
  end
end
