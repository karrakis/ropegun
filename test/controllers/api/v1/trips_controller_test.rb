require "test_helper"

# Reference suite for `api/v1` controller tests: shows the pattern other
# `api/v1` controllers' tests should follow (session-stubbed auth via
# `sign_in_as`, exercising ownership scoping, and covering the
# guest-removal / extra_data-merge behavior in `update`).
class Api::V1::TripsControllerTest < ActionController::TestCase
  include ActionCable::TestHelper

  setup do
    @alice = users(:alice)
    @bob = users(:bob)
    @trip = trips(:alpine_trip)
  end

  test "index requires login" do
    get :index
    assert_response :redirect
  end

  test "index returns only trips the current user belongs to" do
    sign_in_as(@alice)
    get :index
    assert_response :success
    ids = JSON.parse(response.body).map { |t| t["id"] }
    assert_includes ids, @trip.id
  end

  test "show returns the trip with its associations" do
    sign_in_as(@alice)
    get :show, params: { id: @trip.id }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal @trip.id, body["id"]
    assert body.key?("trip_memberships")
    assert body.key?("trip_skills")
    assert body.key?("trip_gear_items")
  end

  test "show raises not found for a user with no membership on the trip" do
    stranger = User.create!(name: "Stranger", email: "stranger@example.com", auth0_sub: "auth0|stranger")
    sign_in_as(stranger)
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, params: { id: @trip.id }
    end
  end

  test "create builds a trip owned by the current user" do
    sign_in_as(@bob)
    assert_difference("Trip.count") do
      post :create, params: { trip: { name: "New Trip", route_mode: "false" } }
    end
    assert_response :created
    assert_equal @bob.id, Trip.order(:created_at).last.owner_id
  end

  test "create response includes a real share_token, not the pre-insert nil" do
    # share_token defaults to gen_random_uuid() at the DB level — the
    # in-memory record from Trip.new/.save doesn't pick that up without a
    # reload, which previously meant the JSON (and the frontend's share
    # link built from it) rendered a literal "null" token.
    sign_in_as(@bob)
    post :create, params: {
      trip: {
        name: "Multi-destination Trip", route_mode: "false",
        locations: [
          { name: "Crag A", latitude: "1.0", longitude: "2.0" },
          { name: "Crag B", latitude: "3.0", longitude: "4.0" }
        ]
      }
    }
    assert_response :created
    body = JSON.parse(response.body)
    assert body["share_token"].present?
    assert_equal Trip.find(body["id"]).share_token, body["share_token"]
  end

  test "update merges extra_data instead of overwriting it" do
    sign_in_as(@alice)
    @trip.update!(extra_data: { "notes" => "bring sunscreen" })
    patch :update, params: { id: @trip.id, trip: { extra_data: { "activity" => "climbing" } } }
    assert_response :success
    @trip.reload
    assert_equal "bring sunscreen", @trip.extra_data["notes"]
    assert_equal "climbing", @trip.extra_data["activity"]
  end

  test "update removes a guest by name via the remove_guest key" do
    sign_in_as(@alice)
    @trip.update!(guest_list: [{ "name" => "Casey", "added_at" => Time.current.iso8601 }])
    patch :update, params: { id: @trip.id, trip: { extra_data: { remove_guest: "Casey" } } }
    assert_response :success
    @trip.reload
    assert_empty @trip.guest_list
  end

  test "update is scoped to the trip owner" do
    sign_in_as(@bob) # bob is only a member, not the owner
    assert_raises(ActiveRecord::RecordNotFound) do
      patch :update, params: { id: @trip.id, trip: { name: "Hijacked" } }
    end
  end

  test "destroy soft-deletes the trip (archives it) rather than removing the row" do
    sign_in_as(@alice)
    trip_id = @trip.id
    delete :destroy, params: { id: trip_id }
    assert_response :no_content
    assert_not Trip.exists?(trip_id)
    assert Trip.archived.exists?(trip_id)
  end

  test "destroy broadcasts so other members find out the trip was canceled" do
    sign_in_as(@alice)
    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      delete :destroy, params: { id: @trip.id }
    end
  end

  test "destroy is scoped to the trip owner" do
    sign_in_as(@bob)
    assert_raises(ActiveRecord::RecordNotFound) do
      delete :destroy, params: { id: @trip.id }
    end
  end

  test "transfer_owner reassigns the trip to another accepted member" do
    sign_in_as(@alice)
    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      patch :transfer_owner, params: { id: @trip.id, new_owner_id: @bob.id }
    end
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal @bob.id, body["owner"]["id"]
    assert_equal @bob.id, @trip.reload.owner_id
  end

  test "transfer_owner is scoped to the trip owner" do
    sign_in_as(@bob)
    assert_raises(ActiveRecord::RecordNotFound) do
      patch :transfer_owner, params: { id: @trip.id, new_owner_id: @bob.id }
    end
  end

  test "transfer_owner rejects a user who isn't a member of the trip" do
    stranger = User.create!(name: "Stranger", email: "stranger@example.com", auth0_sub: "auth0|stranger")
    sign_in_as(@alice)
    patch :transfer_owner, params: { id: @trip.id, new_owner_id: stranger.id }
    assert_response :unprocessable_entity
    assert_equal @alice.id, @trip.reload.owner_id
  end

  test "availability lets a non-organizer accepted member submit their own dates" do
    sign_in_as(@bob) # bob is only a member, not the owner
    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      patch :availability, params: { id: @trip.id, dates: ["2026-01-01", "2026-01-02"] }
    end
    assert_response :success
    @trip.reload
    assert_equal ["2026-01-01", "2026-01-02"], @trip.extra_data["availability"][@bob.id.to_s]
  end

  test "availability only ever writes the current user's own entry" do
    sign_in_as(@alice)
    patch :availability, params: { id: @trip.id, dates: ["2026-01-01"] }
    sign_in_as(@bob)
    patch :availability, params: { id: @trip.id, dates: ["2026-02-02"] }
    @trip.reload
    assert_equal ["2026-01-01"], @trip.extra_data["availability"][@alice.id.to_s]
    assert_equal ["2026-02-02"], @trip.extra_data["availability"][@bob.id.to_s]
  end

  test "availability ignores malformed date strings" do
    sign_in_as(@bob)
    patch :availability, params: { id: @trip.id, dates: ["2026-01-01", "not-a-date"] }
    assert_response :success
    assert_equal ["2026-01-01"], @trip.reload.extra_data["availability"][@bob.id.to_s]
  end

  test "availability is not found for a user with no membership on the trip" do
    stranger = User.create!(name: "Stranger", email: "stranger@example.com", auth0_sub: "auth0|stranger")
    sign_in_as(stranger)
    patch :availability, params: { id: @trip.id, dates: ["2026-01-01"] }
    assert_response :not_found
  end
end
