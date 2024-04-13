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
  
  patch '/users/:id' => 'users#update'
  post '/locations' => 'locations#create'
end
