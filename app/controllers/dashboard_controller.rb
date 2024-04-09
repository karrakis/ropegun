class DashboardController < ApplicationController
    include Secured
  
    def show
      # session[:userinfo] was saved earlier on Auth0Controller#callback
      @user = session[:userinfo]
      @local_user = User.find_by(auth0_sub: @user["sub"]).as_json
      if @user
        @user_saved_locations = User.find_by(auth0_sub: @user&.fetch("sub")).locations
      end
    end
  end