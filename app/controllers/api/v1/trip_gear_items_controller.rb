class Api::V1::TripGearItemsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :redirect_if_not_logged_in

  def create
    trip = current_local_user.owned_trips.find(params[:id])
    gear = GearItem.find(params[:gear_item_id])
    tgi = trip.trip_gear_items.find_or_create_by!(gear_item: gear, user: current_local_user)
    tgi.update!(
      required_quantity: params[:required_quantity]&.to_i || tgi.required_quantity || 1,
      extra_data: (tgi.extra_data || {}).merge(
        "commitments" => tgi.extra_data&.fetch("commitments", []) || []
      )
    )
    trip.broadcast_refresh!
    render json: trip.reload.serialize_for
  end

  def commit
    tgi = TripGearItem.find(params[:id])
    user = User.find(params[:user_id])
    quantity = params[:quantity].to_i
    commitments = tgi.extra_data&.fetch("commitments", []) || []
    previous = commitments.find { |c| c["user_id"] == user.id }
    commitments = commitments.reject { |c| c["user_id"] == user.id }
    if quantity > 0
      commitments << {
        "user_id" => user.id,
        "user_name" => user.name,
        "quantity" => quantity,
        "packed" => previous&.fetch("packed", false) || false
      }
    end
    committed_total = commitments.sum { |c| c["quantity"].to_i }
    tgi.update!(
      quantity: committed_total,
      extra_data: (tgi.extra_data || {}).merge(
        "commitments" => commitments,
        "committed_quantity" => committed_total
      )
    )
    tgi.trip.broadcast_refresh!
    render json: tgi.trip.reload.serialize_for
  end

  # Toggles the signed-in user's own "packed" flag for their commitment on
  # this gear item. Scoped to the current user (never a user_id param) so
  # nobody can mark someone else's packing list item as packed.
  def toggle_packed
    tgi = TripGearItem.find(params[:id])
    commitments = tgi.extra_data&.fetch("commitments", []) || []
    commitment = commitments.find { |c| c["user_id"] == current_local_user.id }
    unless commitment
      return render json: { error: "No commitment to pack" }, status: :unprocessable_entity
    end
    commitment["packed"] = !commitment["packed"]
    tgi.update!(extra_data: (tgi.extra_data || {}).merge("commitments" => commitments))
    tgi.trip.broadcast_refresh!
    render json: tgi.trip.reload.serialize_for
  end

  def update
    tgi = TripGearItem.find(params[:id])
    return unless authorize_organizer!(tgi.trip)
    tgi.update!(required_quantity: params[:required_quantity].to_i)
    tgi.trip.broadcast_refresh!
    render json: tgi.trip.reload.serialize_for
  end

  def destroy
    tgi = TripGearItem.find(params[:id])
    trip = tgi.trip
    return unless authorize_organizer!(trip)
    tgi.destroy!
    trip.broadcast_refresh!
    render json: trip.reload.serialize_for
  end

  private

  def authorize_organizer!(trip)
    return true if trip.owner_id == current_local_user.id
    render json: { error: "Not authorized" }, status: :forbidden
    false
  end

  def current_local_user
    @current_local_user ||= User.find_by(auth0_sub: session[:userinfo]["sub"])
  end
end
