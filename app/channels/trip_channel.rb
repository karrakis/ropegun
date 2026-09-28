class TripChannel < ApplicationCable::Channel
  def subscribed
    trip = Trip.find_by(id: params[:trip_id])
    return reject unless trip && member?(trip)

    stream_for trip
  end

  def unsubscribed
  end

  private

  def member?(trip)
    trip.trip_memberships.exists?(user_id: current_local_user.id)
  end
end
