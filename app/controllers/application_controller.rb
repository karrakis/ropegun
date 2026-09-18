class ApplicationController < ActionController::Base
  def current_user
    @current_user ||= User.find_by(auth0_sub: session[:userinfo]["sub"]) if session[:userinfo]
  end

  def redirect_if_not_logged_in
    unless current_user
      redirect_to login_path(return_to: request.fullpath)
    end
  end
end
