class Api::V1::GearItemsController < ApplicationController
  def index
    render json: GearItem.order(:category, :name).as_json
  end
end
