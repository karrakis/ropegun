class Api::V1::TripCommentsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :redirect_if_not_logged_in

  # Comments load as part of the trip payload itself (see
  # `Trip::BROADCAST_INCLUDE`/`Trip#serialize_for`) — no separate index
  # endpoint, same approach as skills/gear.
  def create
    trip = current_local_user.trips.find(params[:id])
    body = params[:body].to_s.strip
    return render json: { error: "Comment can't be blank" }, status: :unprocessable_entity if body.blank?

    comment = trip.trip_comments.create!(user: current_local_user, body: body)
    trip.broadcast_refresh!
    render json: trip.reload.serialize_for, status: :created
  end

  def destroy
    comment = TripComment.find(params[:id])
    trip = comment.trip
    unless comment.user_id == current_local_user.id || trip.owner_id == current_local_user.id
      return render json: { error: "Not authorized" }, status: :forbidden
    end
    comment.destroy!
    trip.broadcast_refresh!
    render json: trip.reload.serialize_for
  end

  private

  def current_local_user
    @current_local_user ||= User.find_by(auth0_sub: session[:userinfo]["sub"])
  end
end
