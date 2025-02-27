class Api::ApiController < ActionController::API
    def authenticate
        # Check if the request is authenticated
        if request.headers['Authorization']
            # Get the token from the request headers
            token = request.headers['Authorization'].split(' ').last
            # Decode the token
            decoded_token = JWT.decode(token, nil, false)
            # Set the current user
            @current_user = User.find_by(auth0_sub: decoded_token[0]['sub'])
        else
            # Return an error if the request is not authenticated
            render json: { error: 'Unauthorized' }, status: 401
        end
    end
end