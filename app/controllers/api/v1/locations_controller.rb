class Api::V1::LocationsController < ApplicationController
    def create
        @location = Location.new(location_params)
        if @location.save
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