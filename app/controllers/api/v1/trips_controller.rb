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

  def update
    @trip = @local_user.owned_trips.find(params[:id])
    extra_data_update = params[:trip][:extra_data]
    if extra_data_update
      extra_data_hash = extra_data_update.respond_to?(:to_unsafe_h) ? extra_data_update.to_unsafe_h : extra_data_update

      if (guest_name = extra_data_hash.delete("remove_guest") || extra_data_hash.delete(:remove_guest))
        @trip.guest_list = (@trip.guest_list || []).reject { |g| g["name"] == guest_name }
      end

      if extra_data_hash.present?
        @trip.extra_data = (@trip.extra_data || {}).deep_merge(extra_data_hash)
      end
    end
    if @trip.update(trip_params)
      render json: @trip.as_json(include: [:locations, :owner, { trip_memberships: { include: :user } }])
    else
      render json: @trip.errors, status: :unprocessable_entity
    end
  end

  def distances
    @trip = @local_user.trips.find(params[:id])
    members = @trip.trip_memberships.accepted.includes(:user).map(&:user)
    locations = @trip.locations

    per_member = members.map do |user|
      next { user_id: user.id, name: user.name, distances: nil } unless user.home_address.present?
      dist_map = {}
      locations.each do |loc|
        destination = "#{loc.latitude},#{loc.longitude}"
        record = Distance.find_or_create_by(origin: user.home_address, destination: destination)
        result = record.calculate
        if result&.dig("rows", 0, "elements", 0, "status") == "OK"
          el = result["rows"][0]["elements"][0]
          record.update(distance: el["distance"]["text"], duration: el["duration"]["text"])
          dist_map[loc.id] = { distance: el["distance"]["text"], duration: el["duration"]["text"] }
        end
      end
      { user_id: user.id, name: user.name, distances: dist_map }
    end

    members_with_address = members.select { |u| u.home_address.present? }
    missing_addresses = members.length - members_with_address.length

    average = {}
    if members_with_address.any?
      locations.each do |loc|
        dists = per_member.filter_map { |m| m[:distances]&.dig(loc.id, :distance) }
        durs  = per_member.filter_map { |m| m[:distances]&.dig(loc.id, :duration) }
        average[loc.id] = { distance: dists.first, duration: durs.first } if dists.any?
      end
    end

    render json: { per_member: per_member, average: average, missing_addresses: missing_addresses }
  end

  def choose_destination
    @trip = @local_user.owned_trips.find(params[:id])
    chosen = @trip.locations.find(params[:location_id])
    @trip.locations.where.not(id: chosen.id).each { |l| @trip.locations.delete(l) }
    @trip.update!(route_mode: true)
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
