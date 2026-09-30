require "test_helper"

class FeedbacksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @feedback = feedbacks(:one)
  end

  # Feedback is submitted from a modal (see FeedbackModal.tsx) rather than a
  # standalone page, so create is the only action left — it just needs to
  # create the record and report back as JSON.
  test "create saves feedback and responds with the created record" do
    assert_difference("Feedback.count") do
      post feedbacks_path,
        params: { feedback: { title: @feedback.title, body: @feedback.body, email: @feedback.email } },
        as: :json
    end

    assert_response :created
    body = JSON.parse(@response.body)
    assert_equal @feedback.title, body["title"]
    assert_equal @feedback.body, body["body"]
  end

  test "create only accepts the permitted feedback fields" do
    assert_raises(ActionController::ParameterMissing) do
      post feedbacks_path, params: {}, as: :json
    end
  end
end

