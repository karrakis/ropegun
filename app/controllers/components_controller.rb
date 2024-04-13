class ComponentsController < ApplicationController

  def index
    @routes = Rails.application.routes.routes.map { |r| r.name && {r.name.to_sym => {alias: r.name, path: r.path.spec.to_s.sub(/\(\.\:format\)/, '')}}}.compact.reduce Hash.new, :merge
    @user = session[:userinfo]
    @local_user = User.find_by(auth0_sub: @user&.fetch("sub")).as_json
    if @user
      @user_saved_locations = User.find_by(auth0_sub: @user&.fetch("sub")).locations.as_json.map{|location| {id: location["id"], name: location["name"], location: {lat: location["latitude"], lng: location["longitude"]}, office: location["office"], office_x: location["office_x"], office_y: location["office_y"]}}
    end
  end
end
