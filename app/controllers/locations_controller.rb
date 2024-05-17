class LocationsController < ApplicationController
    def create
        @location = Location.new(location_params)
        begin
            @location.user = User.find(location_params[:user_id])
            if @location.save
                render json: @location, status: :created
            else
                render json: @location.errors, status: :unprocessable_entity
            end
        rescue ActiveRecord::RecordNotFound
            render json: { error: 'User not found' }, status: :unprocessable_entity
        end
    end

    private

    def location_params
        params.require(:location).permit(:name, :latitude, :longitude, :office, :office_x, :office_y, :user_id)
    end
end