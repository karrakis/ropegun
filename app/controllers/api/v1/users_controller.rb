class Api::V1::UsersController < ApplicationController
  before_action :redirect_if_not_logged_in

  # Viewer-aware profile lookup — used e.g. when a user clicks another
  # user's name outside of trip context (trip-embedded users are filtered
  # separately by Trip#serialize_for, which treats trip co-membership as
  # friend-level trust regardless of an actual friendship record).
  def show
    target = User.find_by!(uuid: params[:id])
    viewer = current_local_user

    as = if viewer.id == target.id
           :self
         elsif viewer.friends_with?(target)
           :friend
         else
           :public
         end

    render json: target.profile_json(as: as)
  end

  private

  def current_local_user
    @current_local_user ||= User.find_by(auth0_sub: session[:userinfo]["sub"])
  end
end
