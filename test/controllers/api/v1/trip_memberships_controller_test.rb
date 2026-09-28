require "test_helper"

class Api::V1::TripMembershipsControllerTest < ActionController::TestCase
  include ActionCable::TestHelper

  setup do
    @alice = users(:alice) # owner of alpine_trip
    @bob = users(:bob)     # already a member of alpine_trip
    @trip = trips(:alpine_trip)
    @carol = User.create!(name: "Carol Crampon", email: "carol@example.com", auth0_sub: "auth0|test-carol").reload
  end

  test "create requires a signed-in user" do
    post :create, params: { trip_membership: { trip_id: @trip.id, invitee_uuid: @carol.uuid } }
    assert_response :redirect
  end

  test "create invites a new user to a trip the current user owns" do
    sign_in_as(@alice)
    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      assert_difference("@trip.trip_memberships.count") do
        post :create, params: { trip_membership: { trip_id: @trip.id, invitee_uuid: @carol.uuid } }
      end
    end
    assert_response :success

    membership = @trip.trip_memberships.find_by(user: @carol)
    assert membership
    assert membership.invited?
    refute membership.accepted
  end

  test "create is scoped to trips the current user owns" do
    sign_in_as(@bob)
    assert_no_difference("TripMembership.count") do
      assert_raises(ActiveRecord::RecordNotFound) do
        post :create, params: { trip_membership: { trip_id: @trip.id, invitee_uuid: @carol.uuid } }
      end
    end
  end

  test "create rejects inviting someone who is already a member" do
    sign_in_as(@alice)
    assert_no_difference("TripMembership.count") do
      post :create, params: { trip_membership: { trip_id: @trip.id, invitee_uuid: @bob.uuid } }
    end
    assert_response :unprocessable_entity
  end

  test "update accept marks the invitee's own membership as accepted" do
    membership = @trip.trip_memberships.create!(user: @carol, role: :invited, accepted: false, invited_at: Time.current)
    sign_in_as(@carol)

    patch :update, params: { id: membership.id, trip_membership: { action: "accept" } }
    assert_response :success

    membership.reload
    assert membership.accepted
    assert membership.member?
  end

  test "update accept is forbidden for anyone other than the invitee" do
    membership = @trip.trip_memberships.create!(user: @carol, role: :invited, accepted: false, invited_at: Time.current)
    sign_in_as(@alice)

    patch :update, params: { id: membership.id, trip_membership: { action: "accept" } }
    assert_response :forbidden

    refute membership.reload.accepted
  end

  test "update decline destroys the membership" do
    membership = @trip.trip_memberships.create!(user: @carol, role: :invited, accepted: false, invited_at: Time.current)
    sign_in_as(@carol)

    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      assert_difference("TripMembership.count", -1) do
        patch :update, params: { id: membership.id, trip_membership: { action: "decline" } }
      end
    end
    assert_response :success
  end

  test "destroy allows the trip owner to remove a member" do
    membership = trip_memberships(:bob_member_of_alpine_trip)
    sign_in_as(@alice)

    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      assert_difference("TripMembership.count", -1) do
        delete :destroy, params: { id: membership.id }
      end
    end
    assert_response :success
  end

  test "destroy allows a member to remove themselves" do
    membership = trip_memberships(:bob_member_of_alpine_trip)
    sign_in_as(@bob)

    assert_difference("TripMembership.count", -1) do
      delete :destroy, params: { id: membership.id }
    end
    assert_response :success
  end

  test "destroy is forbidden for an unrelated user" do
    membership = trip_memberships(:bob_member_of_alpine_trip)
    sign_in_as(@carol)

    assert_no_difference("TripMembership.count") do
      delete :destroy, params: { id: membership.id }
    end
    assert_response :forbidden
  end
end
