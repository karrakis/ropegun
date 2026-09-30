require "test_helper"

class TripsControllerTest < ActionController::TestCase
  include ActionCable::TestHelper

  setup do
    @alice = users(:alice) # owner of alpine_trip
    @bob = users(:bob)     # already a member of alpine_trip
    @trip = trips(:alpine_trip)
  end

  test "public_show renders for a valid share token, signed out" do
    get :public_show, params: { share_token: @trip.share_token }
    assert_response :success
  end

  test "public_show renders for a valid share token, signed in" do
    sign_in_as(@bob)
    get :public_show, params: { share_token: @trip.share_token }
    assert_response :success
  end

  # Regression test: share links must 404 on a bogus/missing token rather
  # than resolving to `nil` and blowing up downstream (the /trips/null bug).
  test "public_show raises not found for an unknown share token" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :public_show, params: { share_token: "not-a-real-token" }
    end
  end

  test "join creates a membership and broadcasts a refresh for a new member" do
    carol = User.create!(name: "Carol Crampon", email: "carol@example.com", auth0_sub: "auth0|test-carol")
    sign_in_as(carol)

    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      assert_difference("@trip.trip_memberships.count") do
        post :join, params: { share_token: @trip.share_token }
      end
    end

    assert @trip.trip_memberships.exists?(user_id: carol.id, accepted: true)
    assert_redirected_to "/trips/#{@trip.share_token}"
  end

  test "join does not broadcast when the user is already a member" do
    sign_in_as(@bob)

    assert_no_difference("@trip.trip_memberships.count") do
      assert_broadcasts(TripChannel.broadcasting_for(@trip), 0) do
        post :join, params: { share_token: @trip.share_token }
      end
    end
  end

  # Regression test: someone directly invited (role: invited, accepted:
  # false) who then clicks the share link to join, instead of using the
  # Dashboard's Accept button, was silently left as still "invited" because
  # `join` only ever handled the "no membership yet" case.
  test "join accepts an existing pending invitation instead of leaving it stuck as invited" do
    dana = User.create!(name: "Dana Descender", email: "dana@example.com", auth0_sub: "auth0|test-dana")
    membership = @trip.trip_memberships.create!(user: dana, role: :invited, accepted: false, invited_at: Time.current)
    sign_in_as(dana)

    assert_no_difference("@trip.trip_memberships.count") do
      assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
        post :join, params: { share_token: @trip.share_token }
      end
    end

    membership.reload
    assert membership.accepted?
    assert membership.member?
    assert_redirected_to "/trips/#{@trip.share_token}"
  end

  test "add_guest appends to guest_list and broadcasts a refresh" do
    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      post :add_guest, params: { share_token: @trip.share_token, name: "Dana" }
    end

    @trip.reload
    assert @trip.guest_list.any? { |g| g["name"] == "Dana" }
  end

  test "add_guest does not broadcast for a duplicate guest name" do
    @trip.update!(guest_list: [{ "name" => "Dana", "added_at" => Time.current.iso8601 }])

    assert_broadcasts(TripChannel.broadcasting_for(@trip), 0) do
      post :add_guest, params: { share_token: @trip.share_token, name: "Dana" }
    end
  end
end
