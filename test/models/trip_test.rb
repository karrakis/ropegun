require "test_helper"

class TripTest < ActiveSupport::TestCase
  setup do
    @trip = trips(:alpine_trip)
    @alice = users(:alice) # owner
    @bob = users(:bob) # member, already friends with alice
    @carol = User.create!(name: "Carol", email: "carol@example.com", auth0_sub: "auth0|test-carol")
    @trip.trip_memberships.create!(user: @carol, role: :member, accepted: true, joined_at: Time.current)

    @alice.update!(
      email: "alice@example.com",
      about_me: "I climb",
      additional_information: "extra info",
      home_address: "123 Main St"
    )
    @carol.update!(
      about_me: "Carol's bio",
      home_address: "456 Side St"
    )
  end

  test "serialize_for treats trip co-membership as friend-level trust for embedded users" do
    data = @trip.serialize_for

    owner = data["owner"]
    assert_equal "alice@example.com", owner["email"]
    assert_equal "I climb", owner["about_me"]
    assert_equal "extra info", owner["additional_information"]

    carol_membership = data["trip_memberships"].find { |m| m["user"]["id"] == @carol.id }
    assert_equal "Carol's bio", carol_membership["user"]["about_me"]
  end

  test "serialize_for never exposes app_only fields (home_address) for any embedded user" do
    data = @trip.serialize_for

    refute data["owner"].key?("home_address")
    data["trip_memberships"].each do |m|
      refute m["user"].key?("home_address"), "expected #{m['user']['name']} to not expose home_address"
    end
  end

  test "serialize_for never includes the raw profile_visibility map on embedded users" do
    data = @trip.serialize_for
    refute data["owner"].key?("profile_visibility")
    data["trip_memberships"].each { |m| refute m["user"].key?("profile_visibility") }
  end

  test "serialize_for embeds the commenting user filtered the same way" do
    @trip.trip_comments.create!(user: @carol, body: "hi")
    data = @trip.serialize_for
    comment = data["trip_comments"].find { |c| c["user"]["id"] == @carol.id }
    assert_equal "Carol's bio", comment["user"]["about_me"]
    refute comment["user"].key?("home_address")
  end

  test "serialize_for respects a member explicitly hiding a friends-tier field" do
    @carol.update!(profile_visibility: { "about_me" => "app_only" })
    data = @trip.serialize_for
    carol_membership = data["trip_memberships"].find { |m| m["user"]["id"] == @carol.id }
    refute carol_membership["user"].key?("about_me")
  end
end
