require "test_helper"

class Api::V1::TripCommentsControllerTest < ActionController::TestCase
  include ActionCable::TestHelper

  setup do
    @alice = users(:alice) # owner of alpine_trip
    @bob = users(:bob)     # member, not owner
    @trip = trips(:alpine_trip)
    @comment = trip_comments(:alpine_trip_first_comment) # posted by bob
  end

  test "create adds a comment for any trip member, not just the organizer" do
    sign_in_as(@bob)
    assert_difference("TripComment.count") do
      post :create, params: { id: @trip.id, body: "Bringing the 70m." }
    end
    assert_response :created
    comment = TripComment.order(:created_at).last
    assert_equal @bob.id, comment.user_id
    assert_equal "Bringing the 70m.", comment.body
  end

  test "create is scoped to trips the current user is a member of" do
    stranger = User.create!(name: "Stranger", email: "stranger@example.com", auth0_sub: "auth0|stranger")
    sign_in_as(stranger)
    assert_no_difference("TripComment.count") do
      assert_raises(ActiveRecord::RecordNotFound) do
        post :create, params: { id: @trip.id, body: "Hi!" }
      end
    end
  end

  test "create rejects a blank comment" do
    sign_in_as(@alice)
    assert_no_difference("TripComment.count") do
      post :create, params: { id: @trip.id, body: "   " }
    end
    assert_response :unprocessable_entity
  end

  test "create broadcasts a trip refresh" do
    sign_in_as(@alice)
    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      post :create, params: { id: @trip.id, body: "New comment" }
    end
  end

  test "destroy allows the comment's author to remove it" do
    sign_in_as(@bob)
    assert_difference("TripComment.count", -1) do
      delete :destroy, params: { id: @comment.id }
    end
    assert_response :success
  end

  test "destroy allows the trip organizer to remove someone else's comment" do
    sign_in_as(@alice)
    assert_difference("TripComment.count", -1) do
      delete :destroy, params: { id: @comment.id }
    end
    assert_response :success
  end

  test "destroy forbids a non-author, non-organizer member" do
    carol = User.create!(name: "Carol", email: "carol@example.com", auth0_sub: "auth0|test-carol")
    @trip.trip_memberships.create!(user: carol, role: :member, accepted: true, joined_at: Time.current)
    sign_in_as(carol)
    assert_no_difference("TripComment.count") do
      delete :destroy, params: { id: @comment.id }
    end
    assert_response :forbidden
  end
end
