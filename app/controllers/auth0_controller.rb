class Auth0Controller < ApplicationController
    def callback
      # OmniAuth stores the information returned from Auth0 and the IdP in request.env['omniauth.auth'].
      # In this code, you will pull the raw_info supplied from the id_token and assign it to the session.
      # Refer to https://github.com/auth0/omniauth-auth0/blob/master/EXAMPLES.md#example-of-the-resulting-authentication-hash for complete information on 'omniauth.auth' contents.
      auth_info = request.env['omniauth.auth']
      session[:userinfo] = auth_info['extra']['raw_info']

      user = User.find_by(auth0_sub: session[:userinfo]["sub"])
      unless user
        user = User.new(auth0_sub: session[:userinfo]["sub"])
        user.name = "#{session[:userinfo]["given_name"]} #{session[:userinfo]["family_name"]}"
        user.email = session[:userinfo]["email"]
        user.save!
      end
      
      

  
      # Redirect to the URL you want after successful auth
      redirect_to '/'
    end
  
    def failure
      # Handles failed authentication -- Show a failure page (you can also handle with a redirect)
      @error_msg = request.params['message']
    end
  
    def logout
        reset_session
        redirect_to logout_url, allow_other_host: true
      end
    
      private
    
      def logout_url
        request_params = {
          returnTo: root_url,
          client_id: ENV['AUTH0_CLIENT_ID']
        }
    
        URI::HTTPS.build(host: ENV['AUTH0_DOMAIN'], path: '/v2/logout', query: request_params.to_query).to_s
      end
  end