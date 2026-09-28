require "test_helper"

class ComponentsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get root_url
    assert_response :success
  end

  test "direct link to /dashboard is routed to the SPA, not a 404/routing error" do
    get "/dashboard"
    assert_redirected_to login_path(return_to: "/dashboard")
  end
end

class ComponentsControllerActionTest < ActionController::TestCase
  tests ComponentsController

  test "index does not crash on a pending trip invitation and embeds the issuer safely" do
    alice = users(:alice) # owns alpine_trip
    carol = User.create!(
      name: "Carol", email: "carol@example.com", auth0_sub: "auth0|test-carol",
      home_address: "123 Main St"
    )
    trip = trips(:alpine_trip)
    trip.trip_memberships.create!(user: carol, role: :invited, accepted: false, invited_at: Time.current)

    sign_in_as(carol)
    get :index
    assert_response :success

    payload = JSON.parse(response.body[/data-local-user="([^"]*)"/, 1].gsub("&quot;", '"'))
    invitation = payload["pending_trip_invitations"].find { |i| i["trip"]["id"] == trip.id }
    assert invitation, "expected the pending trip invitation to be present"
    assert_equal alice.name, invitation["issuer"]["name"]
    refute invitation["issuer"].key?("home_address"), "issuer's app_only fields must never leak here"
  end

  test "friendships list respects the friend's own visibility choice, not a hardcoded field list" do
    alice = users(:alice)
    bob = users(:bob) # already friends with alice, see fixtures/friendships.yml
    bob.update!(profile_visibility: { "email" => "app_only" })

    sign_in_as(alice)
    get :index
    assert_response :success

    payload = JSON.parse(response.body[/data-local-user="([^"]*)"/, 1].gsub("&quot;", '"'))
    bob_entry = payload["friendships"].find { |f| f["id"] == bob.id }
    assert bob_entry, "expected bob to be in alice's friendships list"
    refute bob_entry.key?("email"), "bob explicitly hid his email even from friends"
  end
end
