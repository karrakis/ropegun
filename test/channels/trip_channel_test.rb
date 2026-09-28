require "test_helper"

class TripChannelTest < ActionCable::Channel::TestCase
  setup do
    @alice = users(:alice) # owner + member of alpine_trip
    @bob = users(:bob)     # member of alpine_trip
    @trip = trips(:alpine_trip)
  end

  test "subscribes and streams for a trip member" do
    stub_connection(current_local_user: @alice)
    subscribe(trip_id: @trip.id)
    assert subscription.confirmed?
    assert_has_stream_for @trip
  end

  test "rejects a user who isn't a member of the trip" do
    stranger = User.create!(name: "Stranger", email: "stranger@example.com", auth0_sub: "auth0|stranger")
    stub_connection(current_local_user: stranger)
    subscribe(trip_id: @trip.id)
    assert subscription.rejected?
  end

  test "rejects subscribing to a nonexistent trip" do
    stub_connection(current_local_user: @alice)
    subscribe(trip_id: 0)
    assert subscription.rejected?
  end

  test "Trip#broadcast_refresh! broadcasts once to the trip's stream" do
    stub_connection(current_local_user: @bob)
    subscribe(trip_id: @trip.id)
    assert subscription.confirmed?

    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      @trip.broadcast_refresh!
    end
  end
end
