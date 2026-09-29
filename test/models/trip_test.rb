require "test_helper"

class TripTest < ActiveSupport::TestCase
  include ActionCable::TestHelper

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

  test "transfer_owner! reassigns owner_id and swaps the owner/member roles" do
    assert_broadcasts(TripChannel.broadcasting_for(@trip), 1) do
      @trip.transfer_owner!(@bob)
    end
    @trip.reload
    assert_equal @bob.id, @trip.owner_id
    assert @trip.trip_memberships.find_by(user: @bob).owner?
    assert @trip.trip_memberships.find_by(user: @alice).member?
  end

  test "transfer_owner! raises if the target isn't an accepted member of the trip" do
    stranger = User.create!(name: "Stranger", email: "stranger@example.com", auth0_sub: "auth0|stranger")
    assert_raises(ArgumentError) { @trip.transfer_owner!(stranger) }
    assert_equal @alice.id, @trip.reload.owner_id
  end

  test "transfer_owner! raises if the target is already the organizer" do
    assert_raises(ArgumentError) { @trip.transfer_owner!(@alice) }
  end
end
