class Api::V1::TripsController < ApplicationController
    skip_before_action :verify_authenticity_token
    def index
        @trips = Trip.all
        puts "TRIPS: #{@trips.to_json}"
        render json: @trips
    end

    def create
        begin
            @trip = Trip.new
            @trip.name = trip_params[:name]
            puts "USER: #{User.find(trip_params[:owner_id]).id}"
            @trip.owner_id = User.find(trip_params[:owner_id]).id
            if @trip.save
                puts "TRIP: #{@trip.id}"
                JSON.parse(trip_params[:locations]).map { |id| Location.find(id) }.each do |location|
                    @trip.locations << location
                end
                render json: @trip, status: :created
            else
                render json: @trip.errors, status: :unprocessable_entity
            end
        rescue => e
            render json: { error: e.message }, status: :unprocessable_entity
        end

    end

    def show
        @trip = Trip.find(params[:id])
        render json: @trip
    end

    private

    def trip_params
        puts "PARAMS: #{params}"
        params.require(:trip).permit(:name, :locations, :owner_id)
    end
end