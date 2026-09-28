require "test_helper"

class FeedbacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @feedback = feedbacks(:one)
  end

  # index/show/edit/update/destroy are intentionally simplified to redirect
  # into the SPA rather than rendering the generated scaffold views/acting
  # on the record — only `new`/`create` are live (linked from Devblog's
  # "Give me Feedback" button).
  test "should get index" do
    get feedbacks_url
    assert_redirected_to development_path
  end

  test "should get new" do
    get new_feedback_url
    assert_response :success
  end

  test "should create feedback" do
    assert_difference("Feedback.count") do
      post feedbacks_url, params: { feedback: { body: @feedback.body, email: @feedback.email, title: @feedback.title } }
    end

    assert_redirected_to development_path
  end

  test "should show feedback" do
    get feedback_url(@feedback)
    assert_redirected_to development_path
  end

  test "should get edit" do
    get edit_feedback_url(@feedback)
    assert_redirected_to development_path
  end

  test "should update feedback" do
    patch feedback_url(@feedback), params: { feedback: { body: @feedback.body, email: @feedback.email, title: @feedback.title } }
    assert_redirected_to development_path
  end

  test "should destroy feedback" do
    assert_no_difference("Feedback.count") do
      delete feedback_url(@feedback)
    end

    assert_redirected_to development_path
  end
end

