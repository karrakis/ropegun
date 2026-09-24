class Api::V1::TripSkillsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :redirect_if_not_logged_in

  def create
    trip = current_local_user.owned_trips.find(params[:id])
    skill = Skill.find(params[:skill_id])
    trip_skill = trip.trip_skills.find_or_create_by!(skill: skill) do |ts|
      ts.user = current_local_user
    end
    render json: trip.reload.as_json(include: trip_include)
  end

  def volunteer
    trip_skill = TripSkill.find(params[:id])
    user = User.find(params[:user_id])
    volunteers = trip_skill.extra_data&.fetch("volunteers", []) || []
    unless volunteers.any? { |v| v["user_id"] == user.id }
      volunteers << { user_id: user.id, user_name: user.name }
      trip_skill.update!(extra_data: (trip_skill.extra_data || {}).merge("volunteers" => volunteers))
    end
    render json: trip_skill.trip.reload.as_json(include: trip_include)
  end

  def unvolunteer
    trip_skill = TripSkill.find(params[:id])
    user = User.find(params[:user_id])
    volunteers = (trip_skill.extra_data&.fetch("volunteers", []) || [])
                   .reject { |v| v["user_id"] == user.id }
    trip_skill.update!(extra_data: (trip_skill.extra_data || {}).merge("volunteers" => volunteers))
    render json: trip_skill.trip.reload.as_json(include: trip_include)
  end

  private

  def current_local_user
    @current_local_user ||= User.find_by(auth0_sub: session[:userinfo]["sub"])
  end

  def trip_include
    [:locations, :owner, { trip_memberships: { include: :user } },
     { trip_skills: { include: :skill } }, { trip_gear_items: { include: :gear_item } }]
  end
end
