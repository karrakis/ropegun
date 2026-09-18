class LandingController < ApplicationController
  def index
    if current_user
      redirect_to trip_plan_path
    else
      @routes = Rails.application.routes.routes.map { |r| r.name && {r.name.to_sym => {alias: r.name, path: r.path.spec.to_s.sub(/\(\.\:format\)/, '')}}}.compact.reduce Hash.new, :merge
    end
  end
end
