module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_local_user

    def connect
      self.current_local_user = find_verified_local_user
    end

    private

    # Reuses the same session-based auth as HTTP requests
    # (`ApplicationController#current_user`): the browser sends the Rails
    # session cookie along with the WebSocket handshake, so no separate
    # cable-specific auth token is needed.
    def find_verified_local_user
      userinfo = request.session[:userinfo]
      user = userinfo && User.find_by(auth0_sub: userinfo["sub"])
      user || reject_unauthorized_connection
    end
  end
end
