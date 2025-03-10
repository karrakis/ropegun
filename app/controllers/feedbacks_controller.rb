class FeedbacksController < ApplicationController
  before_action :set_feedback, only: %i[ show edit update destroy ]

  # GET /feedbacks or /feedbacks.json
  def index
    redirect_to development_path
  end

  # GET /feedbacks/1 or /feedbacks/1.json
  def show
    redirect_to development_path
  end

  # GET /feedbacks/new
  def new
    @feedback = Feedback.new
  end

  # GET /feedbacks/1/edit
  def edit
    redirect_to development_path
  end

  # POST /feedbacks or /feedbacks.json
  def create
    @feedback = Feedback.new(feedback_params)

    respond_to do |format|
      if @feedback.save
        format.html { redirect_to development_path, notice: "Feedback was successfully created." }
        format.json { render :show, status: :created, location: @feedback }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @feedback.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /feedbacks/1 or /feedbacks/1.json
  def update
    redirect_to development_path
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
    redirect_to development_path
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
end
