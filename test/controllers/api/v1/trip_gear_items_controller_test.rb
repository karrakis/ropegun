require "test_helper"

class Api::V1::TripGearItemsControllerTest < ActionController::TestCase
  setup do
    @alice = users(:alice) # owner of alpine_trip
    @bob = users(:bob)     # member, not owner
    @trip = trips(:alpine_trip)
    @tgi = trip_gear_items(:alpine_trip_tent)
  end

  test "create adds a gear item to a trip the current user owns" do
    sign_in_as(@alice)
    assert_difference("TripGearItem.count") do
      post :create, params: { id: @trip.id, gear_item_id: gear_items(:rope).id, required_quantity: "3" }
    end
    assert_response :success
    tgi = TripGearItem.find_by(gear_item: gear_items(:rope), trip: @trip)
    assert_equal 3, tgi.required_quantity
  end

  test "create is scoped to trips the current user owns" do
    sign_in_as(@bob)
    assert_no_difference("TripGearItem.count") do
      assert_raises(ActiveRecord::RecordNotFound) do
        post :create, params: { id: @trip.id, gear_item_id: gear_items(:rope).id }
      end
    end
  end

  # Regression test for the symbol/string jsonb key bug: `commit` must read
  # and write `extra_data["commitments"]` with string keys so `commitments`/
  # `committed_quantity` on the model (and thus the serialized JSON) reflect
  # what was actually just written, not stale/empty data from a key mismatch.
  test "commit records a string-keyed commitment and updates committed_quantity" do
    sign_in_as(@bob)
    patch :commit, params: { id: @tgi.id, user_id: @bob.id, quantity: "2" }
    assert_response :success
    @tgi.reload
    assert_equal 2, @tgi.quantity
    assert_equal 2, @tgi.committed_quantity
    commitment = @tgi.commitments.find { |c| c["user_id"] == @bob.id }
    assert commitment, "expected a commitment for bob"
    assert_equal 2, commitment["quantity"]
  end

  test "commit replaces a user's prior commitment rather than duplicating it" do
    sign_in_as(@bob)
    patch :commit, params: { id: @tgi.id, user_id: @bob.id, quantity: "2" }
    patch :commit, params: { id: @tgi.id, user_id: @bob.id, quantity: "1" }
    assert_response :success
    @tgi.reload
    assert_equal 1, @tgi.committed_quantity
    assert_equal 1, @tgi.commitments.count { |c| c["user_id"] == @bob.id }
  end

  test "commit preserves a previously-set packed flag across re-commits" do
    sign_in_as(@bob)
    patch :commit, params: { id: @tgi.id, user_id: @bob.id, quantity: "2" }
    patch :toggle_packed, params: { id: @tgi.id }
    patch :commit, params: { id: @tgi.id, user_id: @bob.id, quantity: "3" }
    assert_response :success
    @tgi.reload
    commitment = @tgi.commitments.find { |c| c["user_id"] == @bob.id }
    assert_equal true, commitment["packed"]
    assert_equal 3, commitment["quantity"]
  end

  test "toggle_packed flips the signed-in user's own packed flag" do
    sign_in_as(@bob)
    patch :commit, params: { id: @tgi.id, user_id: @bob.id, quantity: "1" }
    @tgi.reload
    commitment = @tgi.commitments.find { |c| c["user_id"] == @bob.id }
    assert_equal false, commitment["packed"]

    patch :toggle_packed, params: { id: @tgi.id }
    assert_response :success
    @tgi.reload
    commitment = @tgi.commitments.find { |c| c["user_id"] == @bob.id }
    assert_equal true, commitment["packed"]

    patch :toggle_packed, params: { id: @tgi.id }
    assert_response :success
    @tgi.reload
    commitment = @tgi.commitments.find { |c| c["user_id"] == @bob.id }
    assert_equal false, commitment["packed"]
  end

  test "toggle_packed only affects the signed-in user's own commitment" do
    sign_in_as(@bob)
    patch :commit, params: { id: @tgi.id, user_id: @bob.id, quantity: "1" }
    sign_in_as(@alice)
    patch :commit, params: { id: @tgi.id, user_id: @alice.id, quantity: "1" }

    sign_in_as(@alice)
    patch :toggle_packed, params: { id: @tgi.id }
    assert_response :success
    @tgi.reload
    alice_commitment = @tgi.commitments.find { |c| c["user_id"] == @alice.id }
    bob_commitment = @tgi.commitments.find { |c| c["user_id"] == @bob.id }
    assert_equal true, alice_commitment["packed"]
    assert_equal false, bob_commitment["packed"]
  end

  test "toggle_packed returns unprocessable_entity when the user has no commitment" do
    sign_in_as(@bob)
    patch :toggle_packed, params: { id: @tgi.id }
    assert_response :unprocessable_entity
  end

  test "update is scoped to the trip owner" do
    sign_in_as(@bob)
    patch :update, params: { id: @tgi.id, required_quantity: "5" }
    assert_response :forbidden
    assert_not_equal 5, @tgi.reload.required_quantity
  end

  test "update succeeds for the trip owner" do
    sign_in_as(@alice)
    patch :update, params: { id: @tgi.id, required_quantity: "5" }
    assert_response :success
    assert_equal 5, @tgi.reload.required_quantity
  end

  test "destroy is scoped to the trip owner" do
    sign_in_as(@bob)
    assert_no_difference("TripGearItem.count") do
      delete :destroy, params: { id: @tgi.id }
    end
    assert_response :forbidden
  end

  test "destroy succeeds for the trip owner" do
    sign_in_as(@alice)
    assert_difference("TripGearItem.count", -1) do
      delete :destroy, params: { id: @tgi.id }
    end
    assert_response :success
  end
end
