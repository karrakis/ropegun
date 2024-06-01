class FriendshipsController < ApplicationController
  def create
    user = User.find(friendship_params[:user_id])
    @friendship = Friendship.new(friend_id: User.find_by(uuid: friendship_params[:friend_uuid]).id, user_id: user.id, accepted: false)
    if @friendship.save
      flash[:notice] = "Friend request sent."
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
    render json: @friendship, status: :ok
  end

  def destroy
    if @friendship = Friendship.find_by(user_id: User.find_by(uuid: friendship_params[:friend_uuid]).id, friend_id: friendship_params[:user_id])
      @friendship.destroy
      flash[:notice] = "Friend request declined."
      render json: { message: "Friend request declined." }, status: :ok
    elsif @friendship = Friendship.find_by(user_id: friendship_params[:user_id], friend_id: User.find_by(uuid: friendship_params[:friend_uuid]).id)
      @friendship.destroy
      flash[:notice] = "Friend request canceled."
      render json: { message: "Friend request canceled." }, status: :ok
    end
  end

  private

  def friendship_params
    params.require(:friendship).permit(:user_id, :friend_uuid, :accepted)
  end
end