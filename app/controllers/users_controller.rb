class UsersController < ApplicationController
    def update
        @user = User.find(params[:id])
        
        #copilot: ArgumentError ('1' is not a valid top_rope_belay):
        
        
        
        puts "user_params: #{sanitized_params}"
        @user.update(sanitized_params)
        render json: @user
    end

    private

    def sanitized_params
        params = user_params
        params[:top_rope_belay] = params[:top_rope_belay].to_i
        params[:lead_belay] = params[:lead_belay].to_i
        params[:trad_lead] = params[:trad_lead].to_i
        params[:multipitch] = params[:multipitch].to_i
        params
    end

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
            :home_address,
            )
    end
end