class Api::V1::DistanceController < ApplicationController
  def show
    distance = Distance.new(params[:origin], params[:destination])
    # okay, no, it's right here.  We should store distance as a model so we don't have to make repeated API calls for
    # the same distance.  We can just look it up in the database.
    render json: { distance: distance.get_distance }
  end

  def create
    destination = "#{params[:destination][:lat]},#{params[:destination][:lng]}"
    distance = Distance.find_or_create_by({origin: params[:origin], destination: destination})
    render json: { distance: distance.calculate }
  end
end