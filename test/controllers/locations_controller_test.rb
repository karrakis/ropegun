require 'test_helper'

class LocationsControllerTest < ActionController::TestCase
  test 'should create location' do
    assert_difference('Location.count') do
      post :create, params: { location: { name: 'Test Location', latitude: 123.456, longitude: 789.012, office: 'Test Office', office_x: 1, office_y: 2, user_id: users(:one).id } }
    end

    assert_response :created
  end

  test 'should not create location with invalid parameters' do
    assert_no_difference('Location.count') do
      post :create, params: { location: { name: '', latitude: nil, longitude: nil, office: '', office_x: nil, office_y: nil, user_id: nil } }
    end

    assert_response :unprocessable_entity
  end
end