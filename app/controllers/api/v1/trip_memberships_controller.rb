class Api::V1::TripMembershipsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :redirect_if_not_logged_in
  before_action :set_local_user

  def create
    trip = @local_user.owned_trips.find(params[:trip_membership][:trip_id])
    invitee = User.find_by!(uuid: params[:trip_membership][:invitee_uuid])

    membership = trip.trip_memberships.find_or_initialize_by(user: invitee)
    return render json: { error: "Already a member" }, status: :unprocessable_entity if membership.persisted?

    membership.role = :invited
    membership.accepted = false
    membership.invited_at = Time.current

    if membership.save
      trip.broadcast_refresh!
      render json: trip.serialize_for
    else
      render json: membership.errors, status: :unprocessable_entity
    end
  end

  def update
    membership = TripMembership.find(params[:id])
    return unless authorize_member!(membership)

    case params[:trip_membership][:action]
    when "accept"
      membership.update!(accepted: true, role: :member, joined_at: Time.current)
    when "decline"
      trip = membership.trip
      membership.destroy!
      trip.broadcast_refresh!
      return render json: { removed: true }
    end

    membership.trip.broadcast_refresh!
    render json: membership.trip.serialize_for
  end

  def destroy
    membership = TripMembership.find(params[:id])
    # Only the trip organizer or the member themselves can remove
    unless membership.trip.owner_id == @local_user.id || membership.user_id == @local_user.id
      return render json: { error: "Unauthorized" }, status: :forbidden
    end
    # The organizer can't just remove their own membership here - that would
    # leave the trip ownerless while trip.owner_id still points at them. They
    # need to transfer ownership to someone else or cancel the trip instead.
    if membership.owner?
      return render json: {
        error: "The organizer can't leave the trip directly \u2014 transfer ownership to another member or cancel the trip instead."
      }, status: :unprocessable_entity
    end
    trip = membership.trip
    membership.destroy!
    trip.broadcast_refresh!
    render json: trip.serialize_for
  end

  private

  def set_local_user
    @local_user = User.find_by(auth0_sub: session[:userinfo]["sub"])
    render json: { error: "User not found" }, status: :unauthorized unless @local_user
  end

  def authorize_member!(membership)
    unless membership.user_id == @local_user.id
      render json: { error: "Unauthorized" }, status: :forbidden
      return false
    end
    true
  end
end
