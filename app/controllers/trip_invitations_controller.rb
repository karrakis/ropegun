class TripInvitationsController < ApplicationController
    before_action :set_trip_invitation, only: [:show, :edit, :update, :destroy]

    def index
        @trip_invitations = TripInvitation.all
    end

    def show
    end

    def new
        @trip_invitation = TripInvitation.new
    end

    def create
        @trip_invitation = TripInvitation.new(trip_invitation_params)

        if @trip_invitation.save
            render json: @trip_invitation, status: :created, location: @trip_invitation
        else
            render json: @trip_invitation.errors, status: :unprocessable_entity
        end
    end

    def edit
    end

    def update
        if @trip_invitation.update(trip_invitation_params)
            redirect_to @trip_invitation, notice: 'Trip invitation was successfully updated.'
        else
            render :edit
        end
    end

    def destroy
        @trip_invitation.destroy
        redirect_to trip_invitations_url, notice: 'Trip invitation was successfully destroyed.'
    end

    private

    def set_trip_invitation
        @trip_invitation = TripInvitation.find(params[:id])
    end

    def trip_invitation_params
        params.require(:trip_invitation).permit(:trip_id, :issuer_id, :invitee_uuid, :accepted)
    end
end