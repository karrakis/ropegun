class UsersController < ApplicationController
    before_action :set_user

    def update
        if @user.update(user_params)
            render json: @user.profile_json(as: :self)
        else
            render json: @user.errors, status: :unprocessable_entity
        end
    end

    private

    # Only the signed-in user may update their own record — params[:id] used
    # to be trusted blindly here, letting any caller edit any user's profile.
    def set_user
        unless current_user
            return render json: { error: "Not authorized" }, status: :unauthorized
        end
        unless current_user.id == params[:id].to_i
            return render json: { error: "Not authorized" }, status: :forbidden
        end
        @user = current_user
    end

    # Only real columns on the users table — the climbing-grade fields this
    # used to permit (:top_rope_belay, :lead_belay, :tr_indoor_climb_grade,
    # etc.) were removed from the schema when skills moved to the
    # user_skills join table and would raise ActiveRecord::UnknownAttributeError.
    def user_params
        params.require(:user).permit(
            :name,
            :email,
            :about_me,
            :additional_information,
            :home_address,
            :discoverable_by_search,
            profile_visibility: {},
        )
    end
end
