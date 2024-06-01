class ComponentsController < ApplicationController

  def index
    @routes = Rails.application.routes.routes.map { |r| r.name && {r.name.to_sym => {alias: r.name, path: r.path.spec.to_s.sub(/\(\.\:format\)/, '')}}}.compact.reduce Hash.new, :merge
    @user = session[:userinfo]
    @local_user = User.find_by(auth0_sub: @user&.fetch("sub"))
    @local_user = @local_user.as_json.merge({
          friendships: @local_user.friendships.accepted.as_json.concat(@local_user.inverse_friendships.accepted.as_json).map{|friendship|
            puts "friendship: #{friendship}"
            friend_id = friendship["friend_id"] == @local_user.id ? friendship["user_id"] : friendship["friend_id"]
            puts "friend_id: #{friend_id}"
            friend = User.find(friend_id)
            {uuid: friend.uuid, email: friend.email, name: friend.name }
          },
          pending_friendship_invitations: @local_user.inverse_friendships.pending.map{|friendship|
            {uuid: friendship.user.uuid, email: friendship.user.email, name: friendship.user.name }
          }.as_json, 
          pending_friend_requests: @local_user.friendships.pending.map{|friendship| 
            {uuid: friendship.friend.uuid}
          }.as_json
        }
      )

    puts "local_user: #{@local_user.as_json}"
    if @user
      @user_saved_locations = User.find_by(auth0_sub: @user&.fetch("sub")).locations.as_json.map{|location| {id: location["id"], name: location["name"], location: {lat: location["latitude"], lng: location["longitude"]}, office: location["office"], office_x: location["office_x"], office_y: location["office_y"]}}
    end
  end
end
