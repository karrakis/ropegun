require "test_helper"

class FriendshipsControllerTest < ActionController::TestCase
  include ActionCable::TestHelper

  setup do
    @alice = users(:alice)
    @bob = users(:bob) # already friends with alice, see fixtures/friendships.yml
    @carol = User.create!(name: "Carol Crampon", email: "carol@example.com", auth0_sub: "auth0|test-carol").reload
  end

  test "create sends a pending friend request" do
    assert_difference("Friendship.count") do
      post :create, params: { friendship: { user_id: @alice.id, friend_uuid: @carol.uuid } }
    end
    assert_response :success

    friendship = Friendship.find_by(user_id: @alice.id, friend_id: @carol.id)
    assert friendship
    refute friendship.accepted
  end

  test "create broadcasts a friendships refresh to both the requester and the recipient" do
    assert_broadcasts(FriendshipsChannel.broadcasting_for(@alice), 1) do
      assert_broadcasts(FriendshipsChannel.broadcasting_for(@carol), 1) do
        post :create, params: { friendship: { user_id: @alice.id, friend_uuid: @carol.uuid } }
      end
    end
  end

  test "create rejects a duplicate friend request" do
    assert_no_difference("Friendship.count") do
      post :create, params: { friendship: { user_id: @alice.id, friend_uuid: @bob.uuid } }
    end
    assert_response :unprocessable_entity
  end

  # Note on param semantics: `user_id` always identifies the *current* user
  # making the request; `friend_uuid` identifies the other party. `update`
  # only matches a friendship where the current user is the recipient
  # (accepting an incoming request), and `destroy` tries both directions
  # (decline an incoming request, or cancel one you sent).

  test "update accepts a pending friend request" do
    friendship = Friendship.create!(user: @alice, friend: @carol, accepted: false)

    # Carol is the recipient of Alice's request, so Carol accepts it.
    patch :update, params: { friendship: { user_id: @carol.id, friend_uuid: @alice.uuid } }
    assert_response :success
    assert friendship.reload.accepted
  end

  test "update broadcasts a friendships refresh to both parties" do
    Friendship.create!(user: @alice, friend: @carol, accepted: false)

    assert_broadcasts(FriendshipsChannel.broadcasting_for(@alice), 1) do
      assert_broadcasts(FriendshipsChannel.broadcasting_for(@carol), 1) do
        patch :update, params: { friendship: { user_id: @carol.id, friend_uuid: @alice.uuid } }
      end
    end
  end

  test "destroy declines a pending request received by the current user" do
    friendship = Friendship.create!(user: @carol, friend: @alice, accepted: false)

    # Alice is the recipient of Carol's request, so Alice declines it.
    assert_difference("Friendship.count", -1) do
      delete :destroy, params: { friendship: { user_id: @alice.id, friend_uuid: @carol.uuid } }
    end
    assert_response :success
    refute Friendship.exists?(friendship.id)
  end

  test "destroy cancels a pending request sent by the current user" do
    friendship = Friendship.create!(user: @alice, friend: @carol, accepted: false)

    # Alice sent the request, so Alice cancels her own outgoing request.
    assert_difference("Friendship.count", -1) do
      delete :destroy, params: { friendship: { user_id: @alice.id, friend_uuid: @carol.uuid } }
    end
    assert_response :success
    refute Friendship.exists?(friendship.id)
  end

  test "destroy broadcasts a friendships refresh to both parties" do
    Friendship.create!(user: @carol, friend: @alice, accepted: false)

    assert_broadcasts(FriendshipsChannel.broadcasting_for(@alice), 1) do
      assert_broadcasts(FriendshipsChannel.broadcasting_for(@carol), 1) do
        delete :destroy, params: { friendship: { user_id: @alice.id, friend_uuid: @carol.uuid } }
      end
    end
  end
end
