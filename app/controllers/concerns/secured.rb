module Secured
    extend ActiveSupport::Concern

    included do
        before_action :logged_in_using_omniauth?
    end

    def logged_in_using_omniauth?
        puts "*************** #{session[:userinfo]} ::: #{session[:userinfo].present?}"
        redirect_to '/' unless session[:userinfo].present?
    end
end