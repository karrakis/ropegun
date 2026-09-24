class Api::V1::TripGearItemsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :redirect_if_not_logged_in

  def create
    trip = current_local_user.owned_trips.find(params[:id])
    gear = GearItem.find(params[:gear_item_id])
    tgi = trip.trip_gear_items.find_or_create_by!(gear_item: gear, user: current_local_user)
    tgi.update!(
      extra_data: (tgi.extra_data || {}).merge(
        "required_quantity" => params[:required_quantity]&.to_i || 1,
        "commitments" => tgi.extra_data&.fetch("commitments", []) || []
      )
    )
    render json: trip.reload.as_json(include: trip_include)
  end

  def commit
    tgi = TripGearItem.find(params[:id])
    user = User.find(params[:user_id])
    quantity = params[:quantity].to_i
    commitments = tgi.extra_data&.fetch("commitments", []) || []
    commitments = commitments.reject { |c| c["user_id"] == user.id }
    commitments << { user_id: user.id, user_name: user.name, quantity: quantity } if quantity > 0
    committed_total = commitments.sum { |c| c["quantity"].to_i }
    tgi.update!(
      quantity: committed_total,
      extra_data: (tgi.extra_data || {}).merge(
        "commitments" => commitments,
        "committed_quantity" => committed_total
      )
    )
    render json: tgi.trip.reload.as_json(include: trip_include)
  end

  private

  def current_local_user
    @current_local_user ||= User.find_by(auth0_sub: session[:userinfo]["sub"])
  end

  def trip_include
    [:locations, :owner, { trip_memberships: { include: :user } },
     { trip_skills: { include: :skill } }, { trip_gear_items: { include: :gear_item } }]
  end
end
