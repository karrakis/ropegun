class ComponentsController < ApplicationController

  def index
    @routes = Rails.application.routes.routes.map { |r| r.name && {r.name.to_sym => {alias: r.name, path: r.path.spec.to_s.sub(/\(\.\:format\)/, '')}}}.compact.reduce Hash.new, :merge
    @user = session[:userinfo]
    @local_user = User.find_by(auth0_sub: @user&.fetch("sub"))
    @local_user = @local_user&.as_json&.merge({
          friendships: @local_user&.friendships&.accepted&.as_json&.concat(@local_user&.inverse_friendships&.accepted&.as_json)&.map{|friendship|
            friend_id = friendship["friend_id"] == @local_user.id ? friendship["user_id"] : friendship["friend_id"]
            friend = User.find(friend_id)
            {uuid: friend.uuid, email: friend.email, name: friend.name }
          },
          pending_friendship_invitations: @local_user&.inverse_friendships&.pending&.map{|friendship|
            {uuid: friendship.user.uuid, email: friendship.user.email, name: friendship.user.name }
          }&.as_json, 
          pending_friend_requests: @local_user&.friendships&.pending&.map{|friendship| 
            {uuid: friendship.friend.uuid}
          }&.as_json,
          pending_trip_invitations: @local_user&.trip_invites_received&.pending&.as_json(include: [:issuer, :trip])
        }
      )
  end
end
