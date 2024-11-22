class Api::V1::LocationsController < ApplicationController
    def create
        @location = Location.find_by(latitude: location_params[:latitude], longitude: location_params[:longitude])
        if @location
            render json: @location, status: :ok
        elsif Location.new(location_params).save
            @location = Location.find_by(latitude: location_params[:latitude], longitude: location_params[:longitude])
            render json: @location, status: :created
        else
            render json: @location.errors, status: :unprocessable_entity
        end
    end

    private

    def location_params
        params.require(:location).permit(:name, :latitude, :longitude, :office, :office_x, :office_y)
    end
end