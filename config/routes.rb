Rails.application.routes.draw do
  root 'components#index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"

  get '/auth/auth0/callback' => 'auth0#callback'
  get '/auth/failure' => 'auth0#failure'
  get '/auth/logout' => 'auth0#logout'
  get '/dashboard' => 'components#index'
  get '/trip_plan' => 'components#index'
  get '/development' => 'components#index'
  
  patch '/users/:id' => 'users#update'
  post '/locations' => 'locations#create'
  
  post '/friendships' => 'friendships#create'
  patch '/friendships' => 'friendships#update'
  delete '/friendships' => 'friendships#destroy'

  post '/trip_invitations' => 'trip_invitations#create'
  patch '/trip_invitations' => 'trip_invitations#update'
  delete '/trip_invitations' => 'trip_invitations#destroy'

  namespace :api do
    namespace :v1 do
      get '/distance' => 'distance#show'
      post '/distance' => 'distance#create'
      
      get '/trips' => 'trips#index'
      post '/trips' => 'trips#create'
      get '/trips/:id' => 'trips#show'
      patch '/trips/:id' => 'trips#update'
      delete '/trips/:id' => 'trips#destroy'
      
    end
  end
end
