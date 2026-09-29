require "test_helper"

class FriendshipsChannelTest < ActionCable::Channel::TestCase
  setup do
    @alice = users(:alice)
  end

  test "subscribes and streams for the current local user" do
    stub_connection(current_local_user: @alice)
    subscribe
    assert subscription.confirmed?
    assert_has_stream_for @alice
  end

  test "User#broadcast_friendships_refresh! broadcasts once to the user's own stream" do
    stub_connection(current_local_user: @alice)
    subscribe
    assert subscription.confirmed?

    assert_broadcasts(FriendshipsChannel.broadcasting_for(@alice), 1) do
      @alice.broadcast_friendships_refresh!
    end
  end
end
