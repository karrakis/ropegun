require "test_helper"

class Api::V1::TripSkillsControllerTest < ActionController::TestCase
  setup do
    @alice = users(:alice) # owner of alpine_trip
    @bob = users(:bob)     # member, not owner
    @trip = trips(:alpine_trip)
    @trip_skill = trip_skills(:alpine_trip_first_aid)
  end

  test "create adds a skill to a trip the current user owns" do
    sign_in_as(@alice)
    assert_difference("TripSkill.count") do
      post :create, params: { id: @trip.id, skill_id: skills(:navigation).id }
    end
    assert_response :success
    assert TripSkill.exists?(trip: @trip, skill: skills(:navigation))
  end

  test "create is scoped to trips the current user owns" do
    sign_in_as(@bob)
    assert_no_difference("TripSkill.count") do
      assert_raises(ActiveRecord::RecordNotFound) do
        post :create, params: { id: @trip.id, skill_id: skills(:navigation).id }
      end
    end
  end

  # Regression test for the symbol/string jsonb key bug: `volunteer` must
  # read and write `extra_data["volunteers"]` with string keys so the
  # `volunteers` method (and thus the serialized JSON) reflects what was
  # actually just written, not stale/empty data from a key mismatch.
  test "volunteer records the user with string keys and is idempotent" do
    sign_in_as(@bob)
    patch :volunteer, params: { id: @trip_skill.id, user_id: @bob.id }
    patch :volunteer, params: { id: @trip_skill.id, user_id: @bob.id }
    assert_response :success
    @trip_skill.reload
    assert_equal 1, @trip_skill.volunteers.count { |v| v["user_id"] == @bob.id }
    volunteer = @trip_skill.volunteers.find { |v| v["user_id"] == @bob.id }
    assert_equal @bob.name, volunteer["user_name"]
  end

  test "unvolunteer removes the user from the volunteers list" do
    sign_in_as(@bob)
    patch :volunteer, params: { id: @trip_skill.id, user_id: @bob.id }
    patch :unvolunteer, params: { id: @trip_skill.id, user_id: @bob.id }
    assert_response :success
    @trip_skill.reload
    assert_empty @trip_skill.volunteers.select { |v| v["user_id"] == @bob.id }
  end
end
