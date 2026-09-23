class Api::V1::TripsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :redirect_if_not_logged_in
  before_action :set_current_local_user

  def index
    trips = @local_user.trips.includes(:locations, :owner, :trip_memberships)
    render json: trips.as_json(include: [:owner, :locations, { trip_memberships: { include: :user } }])
  end

  def create
    begin
      @trip = Trip.new(
        name: trip_params[:name],
        owner: @local_user,
        route_mode: trip_params[:route_mode] == "true" || trip_params[:route_mode] == true,
        starts_on: trip_params[:starts_on],
        ends_on: trip_params[:ends_on]
      )
      if @trip.save
        location_data = params[:trip][:locations] || []
        location_data.each_with_index do |attrs, index|
          location = Location.find_or_create_by!(
            latitude: attrs[:latitude].to_s,
            longitude: attrs[:longitude].to_s
          ) do |l|
            l.name       = attrs[:name]
            l.office     = attrs[:office]
            l.office_x   = attrs[:office_x]
            l.office_y   = attrs[:office_y]
          end
          @trip.locations << location unless @trip.locations.include?(location)
          ActiveRecord::Base.connection.execute(
            "UPDATE trips_locations SET position = #{index} WHERE trip_id = #{@trip.id} AND location_id = #{location.id}"
          )
        end
        render json: @trip.as_json(include: [:locations, :owner, { trip_memberships: { include: :user } }]),
               status: :created
      else
        render json: @trip.errors, status: :unprocessable_entity
      end
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def update
    @trip = @local_user.trips.find(params[:id])
    handle_locations
    
    if @trip.update(trip_params)
      render json: @trip.as_json(include: [:locations, :owner, { trip_memberships: { include: :user } }])
    else
      render json: @trip.errors, status: :unprocessable_entity
    end
  end

  def show
    @trip = @local_user.trips.find(params[:id])
    render json: @trip.as_json(include: [:locations, :owner, { trip_memberships: { include: :user } }])
  end

  private

  def handle_locations
    location_data = params[:trip][:locations] || []
    location_data.each_with_index do |attrs, index|
        location = Location.find_or_create_by!(
        latitude: attrs[:latitude].to_s,
        longitude: attrs[:longitude].to_s
        ) do |l|
        l.name       = attrs[:name]
        l.office     = attrs[:office]
        l.office_x   = attrs[:office_x]
        l.office_y   = attrs[:office_y]
        end
        @trip.locations << location unless @trip.locations.include?(location)
        ActiveRecord::Base.connection.execute(
        "UPDATE trips_locations SET position = #{index} WHERE trip_id = #{@trip.id} AND location_id = #{location.id}"
        )
    end
  end

  def set_current_local_user
    @local_user = User.find_by(auth0_sub: session[:userinfo]["sub"])
    render json: { error: "User not found" }, status: :unauthorized unless @local_user
  end

  def trip_params
    params.require(:trip).permit(:name, :route_mode, :starts_on, :ends_on)
  end
end
