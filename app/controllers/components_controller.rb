class ComponentsController < ApplicationController
  def index
    @routes = Rails.application.routes.routes.map { |r| r.name && {r.name.to_sym => {alias: r.name, path: r.path.spec.to_s}}}.compact.reduce Hash.new, :merge
  end
end
