require "test_helper"

class Api::V1::UsersControllerTest < ActionController::TestCase
  setup do
    @alice = users(:alice)
    @bob = users(:bob) # already friends with alice, see fixtures/friendships.yml
    @carol = User.create!(name: "Carol", email: "carol@example.com", auth0_sub: "auth0|test-carol")
    @alice.update!(
      about_me: "I climb",
      additional_information: "extra info",
      home_address: "123 Main St"
    )
  end

  test "requires a signed-in user" do
    get :show, params: { id: @alice.uuid }
    assert_response :redirect
  end

  test "self sees every field plus the visibility map" do
    sign_in_as(@alice)
    get :show, params: { id: @alice.uuid }
    body = JSON.parse(response.body)
    assert_equal "I climb", body["about_me"]
    assert_equal "extra info", body["additional_information"]
    assert_equal "123 Main St", body["home_address"]
    assert body.key?("profile_visibility")
  end

  test "an accepted friend sees public/friends fields but never app_only fields" do
    sign_in_as(@bob)
    get :show, params: { id: @alice.uuid }
    body = JSON.parse(response.body)
    assert_equal "I climb", body["about_me"]
    assert_equal "alice@example.com", body["email"]
    assert_equal "extra info", body["additional_information"]
    refute body.key?("home_address")
    refute body.key?("profile_visibility")
  end

  test "a stranger only sees fields explicitly marked public" do
    sign_in_as(@carol)
    get :show, params: { id: @alice.uuid }
    body = JSON.parse(response.body)
    assert_equal "I climb", body["about_me"]
    refute body.key?("email")
    refute body.key?("additional_information")
    refute body.key?("home_address")
    assert_equal @alice.name, body["name"]
  end

  test "search requires a signed-in user" do
    get :search, params: { q: "Carol" }
    assert_response :redirect
  end

  test "search only returns users who opted in via discoverable_by_search" do
    @carol.update!(discoverable_by_search: true)
    sign_in_as(@alice)
    get :search, params: { q: "Carol" }
    names = JSON.parse(response.body).map { |u| u["name"] }
    assert_includes names, "Carol"
  end

  test "new users are discoverable by default without having to opt in" do
    assert @carol.discoverable_by_search
  end

  test "search excludes non-discoverable users even with an exact name match" do
    @carol.update!(discoverable_by_search: false) # explicitly opted out
    sign_in_as(@alice)
    get :search, params: { q: "Carol" }
    names = JSON.parse(response.body).map { |u| u["name"] }
    refute_includes names, "Carol"
  end

  test "search excludes the requester themselves" do
    @alice.update!(discoverable_by_search: true)
    sign_in_as(@alice)
    get :search, params: { q: "Alice" }
    ids = JSON.parse(response.body).map { |u| u["id"] }
    refute_includes ids, @alice.id
  end

  test "search excludes users already friended (either direction) or pending" do
    @carol.update!(discoverable_by_search: true)
    Friendship.create!(user_id: @alice.id, friend_id: @carol.id, accepted: false) # pending, alice -> carol
    sign_in_as(@alice)
    get :search, params: { q: "Carol" }
    assert_empty JSON.parse(response.body)

    # bob and alice are already accepted friends (fixtures/friendships.yml)
    @bob.update!(discoverable_by_search: true)
    get :search, params: { q: "Bob" }
    assert_empty JSON.parse(response.body)
  end

  test "search matches by email as well as name" do
    @carol.update!(discoverable_by_search: true)
    sign_in_as(@alice)
    get :search, params: { q: "carol@example" }
    names = JSON.parse(response.body).map { |u| u["name"] }
    assert_includes names, "Carol"
  end

  test "search never returns email for a stranger, even though it was the search key" do
    @carol.update!(discoverable_by_search: true) # default email visibility is "friends"
    sign_in_as(@alice)
    get :search, params: { q: "carol@example" }
    body = JSON.parse(response.body)
    refute body.first.key?("email")
  end

  test "search returns an empty list for a blank query" do
    sign_in_as(@alice)
    get :search, params: { q: "" }
    assert_equal [], JSON.parse(response.body)
  end
end

