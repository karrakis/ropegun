class ApplicationController < ActionController::Base
  def current_user
    session[:userinfo]
  end

  def redirect_if_not_logged_in
    unless current_user
      redirect_to login_path(return_to: request.fullpath)
    end
  end
end
