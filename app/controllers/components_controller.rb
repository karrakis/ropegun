class ComponentsController < ApplicationController
  before_action :redirect_if_not_logged_in, only: [:index]

  def index
    @routes = Rails.application.routes.routes.map { |r| r.name && {r.name.to_sym => {alias: r.name, path: r.path.spec.to_s.sub(/\(\.\:format\)/, '')}}}.compact.reduce Hash.new, :merge
    @user = session[:userinfo]
    @local_user = User.find_by(auth0_sub: @user&.fetch("sub"))
    @local_user = @local_user&.as_json&.merge(
      (@local_user&.friendships_payload || {}).merge({
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
      })
    )
  end

end

