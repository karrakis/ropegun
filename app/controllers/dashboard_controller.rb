class DashboardController < ApplicationController
    include Secured
  
    def show
      # session[:userinfo] was saved earlier on Auth0Controller#callback
      @user = session[:userinfo]
    end
  end