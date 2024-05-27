class TripsController < ApplicationController
    def create
        @trip = Trip.new(trip_params)
        @trip.owner = current_user

        if @trip.save
            render json: @trip, status: :created
        else
            render json: @trip.errors, status: :unprocessable_entity
        end
    end

    def show
        @trip = Trip.find(params[:id])
        render json: @trip
    end

    private

    def trip_params
        params.require(:trip).permit(:name)
    end
end