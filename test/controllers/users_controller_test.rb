require "test_helper"

class UsersControllerTest < ActionController::TestCase
  setup do
    @alice = users(:alice)
    @bob = users(:bob)
  end

  test "requires a signed-in user" do
    patch :update, params: { id: @alice.id, user: { about_me: "hi" } }
    assert_response :unauthorized
  end

  test "refuses to update another user's profile" do
    sign_in_as(@bob)
    patch :update, params: { id: @alice.id, user: { about_me: "hacked" } }
    assert_response :forbidden
    assert_nil @alice.reload.about_me
  end

  test "updates the signed-in user's own real profile fields" do
    sign_in_as(@alice)
    patch :update, params: {
      id: @alice.id,
      user: { about_me: "I climb", additional_information: "extra", home_address: "123 Main St" }
    }
    assert_response :success
    @alice.reload
    assert_equal "I climb", @alice.about_me
    assert_equal "extra", @alice.additional_information
    assert_equal "123 Main St", @alice.home_address
  end

  test "updates profile_visibility with only known fields/tiers surviving" do
    sign_in_as(@alice)
    patch :update, params: {
      id: @alice.id,
      user: { profile_visibility: { email: "public", home_address: "bogus", not_a_field: "public" } }
    }
    assert_response :success
    assert_equal({ "email" => "public" }, @alice.reload.profile_visibility)
  end

  test "response is the self-level profile_json, not a raw record dump" do
    sign_in_as(@alice)
    patch :update, params: { id: @alice.id, user: { about_me: "I climb" } }
    body = JSON.parse(response.body)
    assert_equal "I climb", body["about_me"]
    assert body.key?("profile_visibility")
  end
end
