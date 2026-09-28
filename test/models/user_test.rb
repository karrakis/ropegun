require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    @alice = users(:alice)
    @bob = users(:bob)
    @carol = User.create!(name: "Carol", email: "carol@example.com", auth0_sub: "auth0|test-carol")
  end

  test "visibility_for falls back to defaults when unset" do
    assert_equal "friends", @alice.visibility_for("email")
    assert_equal "friends", @alice.visibility_for(:email)
    assert_equal "public", @alice.visibility_for("about_me")
    assert_equal "friends", @alice.visibility_for("additional_information")
    assert_equal "app_only", @alice.visibility_for("home_address")
  end

  test "visibility_for reads an explicitly set tier" do
    @alice.update!(profile_visibility: { "email" => "public" })
    assert_equal "public", @alice.visibility_for("email")
  end

  test "profile_visibility= drops unknown fields and invalid tiers" do
    @alice.profile_visibility = { "email" => "public", "not_a_field" => "public", "home_address" => "bogus_tier" }
    assert_equal({ "email" => "public" }, @alice.profile_visibility)
  end

  test "profile_visibility= accepts symbol keys/values (string-normalized)" do
    @alice.profile_visibility = { email: "public" }
    assert_equal({ "email" => "public" }, @alice.profile_visibility)
  end

  test "friends_with? is true only for accepted friendships in either direction" do
    assert @alice.friends_with?(@bob)
    assert @bob.friends_with?(@alice)
    refute @alice.friends_with?(@carol)
    refute @alice.friends_with?(@alice)
  end

  test "profile_json(as: :self) includes every field plus the visibility map" do
    @alice.update!(about_me: "I climb", home_address: "123 Main St")
    json = @alice.profile_json(as: :self)
    assert_equal "alice@example.com", json["email"]
    assert_equal "123 Main St", json["home_address"]
    assert_equal "I climb", json["about_me"]
    assert json.key?("profile_visibility")
  end

  test "profile_json(as: :friend) excludes app_only fields but includes friends/public fields" do
    @alice.update!(about_me: "I climb", home_address: "123 Main St", additional_information: "extra")
    json = @alice.profile_json(as: :friend)
    assert_equal "alice@example.com", json["email"]
    assert_equal "I climb", json["about_me"]
    assert_equal "extra", json["additional_information"]
    refute json.key?("home_address")
    refute json.key?("profile_visibility")
  end

  test "profile_json(as: :public) only includes fields explicitly marked public" do
    @alice.update!(about_me: "I climb", home_address: "123 Main St")
    json = @alice.profile_json(as: :public)
    assert_equal "I climb", json["about_me"]
    refute json.key?("email")
    refute json.key?("home_address")
    refute json.key?("additional_information")
  end

  test "profile_json(as: :public) respects a field explicitly opened up to public" do
    @alice.update!(email: "alice@example.com", profile_visibility: { "email" => "public" })
    json = @alice.profile_json(as: :public)
    assert_equal "alice@example.com", json["email"]
  end

  test "profile_json always includes id, uuid and name regardless of viewer" do
    json = @alice.profile_json(as: :public)
    assert_equal @alice.id, json["id"]
    assert_equal @alice.uuid, json["uuid"]
    assert_equal @alice.name, json["name"]
  end
end
