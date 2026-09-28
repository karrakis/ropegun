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
end
