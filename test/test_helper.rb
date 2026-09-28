ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

class ActiveSupport::TestCase
  # Run tests in parallel with specified workers
  parallelize(workers: :number_of_processors)

  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Stubs the Auth0-backed session for controller/request tests so
  # `ApplicationController#current_user` (and the various
  # `set_current_local_user`/`current_local_user` helpers built on top of
  # `session[:userinfo]["sub"]`) resolve to the given user without needing
  # a real Auth0 round-trip. Only meaningful for `ActionController::TestCase`
  # subclasses, since that's what exposes a writable `session`.
  def sign_in_as(user)
    session[:userinfo] = { "sub" => user.auth0_sub }
  end

  # Add more helper methods to be used by all tests here...
end
