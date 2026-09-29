class FriendshipsChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_local_user
  end

  def unsubscribed
  end
end
