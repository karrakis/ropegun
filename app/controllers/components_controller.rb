class ComponentsController < ApplicationController
  before_action :redirect_if_not_logged_in, only: [:index]

  def index
    @routes = Rails.application.routes.routes.map { |r| r.name && {r.name.to_sym => {alias: r.name, path: r.path.spec.to_s.sub(/\(\.\:format\)/, '')}}}.compact.reduce Hash.new, :merge
    @user = session[:userinfo]
    @local_user = User.find_by(auth0_sub: @user&.fetch("sub"))
    @local_user = @local_user&.as_json&.merge({
          # Friendship is mutual trust, so embed the friend's profile at
          # friend-tier visibility (User#profile_json) rather than a
          # hand-picked field list — this way a friend's own visibility
          # choice (e.g. hiding their email even from friends) is honored
          # here too, instead of always leaking it regardless of their
          # settings.
          friendships: @local_user&.friendships&.accepted&.as_json&.concat(@local_user&.inverse_friendships&.accepted&.as_json)&.map{|friendship|
            friend_id = friendship["friend_id"] == @local_user.id ? friendship["user_id"] : friendship["friend_id"]
            User.find(friend_id).profile_json(as: :friend)
          },
          pending_friendship_invitations: @local_user&.inverse_friendships&.pending&.map{|friendship|
            {uuid: friendship.user.uuid, email: friendship.user.email, name: friendship.user.name }
          }&.as_json, 
          pending_friend_requests: @local_user&.friendships&.pending&.map{|friendship| 
            {uuid: friendship.friend.uuid}
          }&.as_json,
          # TripMembership has no :issuer association — the trip owner is
          # the de facto issuer of an invite (only owners can create
          # trip_memberships), embedded at friend-tier visibility for the
          # same reason as the friendships list above.
          pending_trip_invitations: @local_user&.trip_memberships&.where(role: :invited, accepted: false)&.includes(trip: :owner)&.map { |membership|
            {
              id: membership.id,
              trip: { id: membership.trip.id, name: membership.trip.name },
              issuer: membership.trip.owner&.profile_json(as: :friend)
            }
          }
        }
      )
  end

end

