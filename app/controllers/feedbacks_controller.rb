class FeedbacksController < ApplicationController
  # Feedback is submitted from a modal (see FeedbackModal.tsx, opened from
  # the header's Feedback button) rather than a standalone page, so this
  # only ever needs to accept the POST and report back success/failure as
  # JSON — there's no page left to render or redirect to.
  def create
    feedback = Feedback.new(feedback_params)

    if feedback.save
      render json: feedback, status: :created
    else
      render json: feedback.errors, status: :unprocessable_entity
    end
  end

  private

  def feedback_params
    params.require(:feedback).permit(:title, :body, :email)
  end
end
