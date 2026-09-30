class FeedbacksController < ApplicationController
  before_action :set_feedback, only: %i[ show edit update destroy ]

  # GET /feedbacks or /feedbacks.json
  def index
    redirect_to root_path
  end

  # GET /feedbacks/1 or /feedbacks/1.json
  def show
    redirect_to root_path
  end

  # GET /feedbacks/new
  def new
    @feedback = Feedback.new
    @return_to = safe_return_to(params[:return_to])
  end

  # GET /feedbacks/1/edit
  def edit
    redirect_to root_path
  end

  # POST /feedbacks or /feedbacks.json
  def create
    @feedback = Feedback.new(feedback_params)
    @return_to = safe_return_to(params[:return_to])

    respond_to do |format|
      if @feedback.save
        format.html { redirect_to @return_to, notice: "Feedback was successfully created." }
        format.json { render :show, status: :created, location: @feedback }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @feedback.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /feedbacks/1 or /feedbacks/1.json
  def update
    redirect_to root_path
    # respond_to do |format|
    #   if @feedback.update(feedback_params)
    #     format.html { redirect_to feedback_url(@feedback), notice: "Feedback was successfully updated." }
    #     format.json { render :show, status: :ok, location: @feedback }
    #   else
    #     format.html { render :edit, status: :unprocessable_entity }
    #     format.json { render json: @feedback.errors, status: :unprocessable_entity }
    #   end
    # end
  end

  # DELETE /feedbacks/1 or /feedbacks/1.json
  def destroy
    redirect_to root_path
    # @feedback.destroy

    # respond_to do |format|
    #   format.html { redirect_to feedbacks_url, notice: "Feedback was successfully destroyed." }
    #   format.json { head :no_content }
    # end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_feedback
      @feedback = Feedback.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def feedback_params
      params.require(:feedback).permit(:title, :body, :email)
    end

    # The feedback form is reached from any SPA page (see HeaderLeft.tsx's
    # Feedback link, which passes the current page as ?return_to=...) so
    # both the Back link and the post-submit redirect can return the user
    # to wherever they came from instead of a fixed page. Only relative
    # in-app paths are honored (never an absent/blank/protocol-relative or
    # absolute URL) to avoid this becoming an open redirect.
    def safe_return_to(path)
      return root_path if path.blank?
      return root_path unless path.start_with?("/") && !path.start_with?("//")

      path
    end
end
