Rails.application.routes.draw do
  resources :feedbacks
  root 'landing#index'

  get '/auth/auth0/callback' => 'auth0#callback'
  get '/auth/failure' => 'auth0#failure'
  get '/auth/logout' => 'auth0#logout'
  get '/auth/login' => 'auth0#login'
  get '/login' => 'auth0#show_login', as: :login
  get '/dashboard' => 'components#index'
  get '/trip_plan' => 'components#index', as: :trip_plan
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
      post '/locations' => 'locations#create'
      
      get '/trips' => 'trips#index'
      post '/trips' => 'trips#create'
      get '/trips/:id' => 'trips#show'
      patch '/trips/:id' => 'trips#update'
      delete '/trips/:id' => 'trips#destroy'
      get '/trips/:id/distances' => 'trips#distances'
      patch '/trips/:id/choose_destination' => 'trips#choose_destination'

      post '/trip_memberships' => 'trip_memberships#create'
      patch '/trip_memberships/:id' => 'trip_memberships#update'
      delete '/trip_memberships/:id' => 'trip_memberships#destroy'

      get  '/skills'    => 'skills#index'
      get  '/gear_items' => 'gear_items#index'
      get  '/locations/:location_id/weather' => 'location_weather#show'

      post   '/trips/:id/skills'            => 'trip_skills#create'
      patch  '/trip_skills/:id/volunteer'   => 'trip_skills#volunteer'
      patch  '/trip_skills/:id/unvolunteer' => 'trip_skills#unvolunteer'

      post   '/trips/:id/gear_items'              => 'trip_gear_items#create'
      patch  '/trip_gear_items/:id/commit'        => 'trip_gear_items#commit'
      
    end
  end
end
