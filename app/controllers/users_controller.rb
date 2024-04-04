class UsersController < ApplicationController
    def update
        @user = User.find(params[:id])
        @user.update(user_params)
        render json: @user
    end

    private

    def user_params
        params.require(:user).permit(
            :name, 
            :email, 
            :lead_belay, 
            :top_rope_belay, 
            :tr_indoor_climb_grade,
            :tr_outdoor_climb_grade,
            :lead_climb_indoor_grade,
            :lead_climb_outdoor_grade,
            :trad_lead,
            :trad_climb_outdoor_grade,
            :multipitch,
            )
    end
end