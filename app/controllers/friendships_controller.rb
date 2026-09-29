class FriendshipsController < ApplicationController
  def create
    user = User.find(friendship_params[:user_id])
    @friendship = Friendship.new(friend_id: User.find_by(uuid: friendship_params[:friend_uuid]).id, user_id: user.id, accepted: false)
    if @friendship.save
      flash[:notice] = "Friend request sent."
      broadcast_friendships_refresh!(@friendship)
      render json: @friendship, status: :ok
    else
      flash[:error] = "Unable to send friend request."
      render json: @friendship.errors, status: :unprocessable_entity
    end
  end

  def update
    @friendship = Friendship.find_by(user_id: User.find_by(uuid: friendship_params[:friend_uuid]).id, friend_id: friendship_params[:user_id])
    @friendship.update(accepted: true)
    flash[:notice] = "Friend request accepted."
    broadcast_friendships_refresh!(@friendship)
    render json: @friendship, status: :ok
  end

  def destroy
    if @friendship = Friendship.find_by(user_id: User.find_by(uuid: friendship_params[:friend_uuid]).id, friend_id: friendship_params[:user_id])
      users = [@friendship.user, @friendship.friend]
      @friendship.destroy
      flash[:notice] = "Friend request declined."
      broadcast_friendships_refresh!(users)
      render json: { message: "Friend request declined." }, status: :ok
    elsif @friendship = Friendship.find_by(user_id: friendship_params[:user_id], friend_id: User.find_by(uuid: friendship_params[:friend_uuid]).id)
      users = [@friendship.user, @friendship.friend]
      @friendship.destroy
      flash[:notice] = "Friend request canceled."
      broadcast_friendships_refresh!(users)
      render json: { message: "Friend request canceled." }, status: :ok
    end
  end

  private

  def friendship_params
    params.require(:friendship).permit(:user_id, :friend_uuid, :accepted)
  end

  # Notifies both sides of a friendship (requester + recipient) so any
  # friendship-related list either of them has open updates live, without
  # needing a manual reload. Accepts either a Friendship (reads .user/.friend)
  # or an explicit array of users (needed in destroy, after the record's
  # already gone).
  def broadcast_friendships_refresh!(friendship_or_users)
    users = friendship_or_users.is_a?(Array) ? friendship_or_users : [friendship_or_users.user, friendship_or_users.friend]
    users.compact.each(&:broadcast_friendships_refresh!)
  end
end
