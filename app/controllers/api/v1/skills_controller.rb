class Api::V1::SkillsController < ApplicationController
  def index
    render json: Skill.order(:category, :name).as_json
  end
end
