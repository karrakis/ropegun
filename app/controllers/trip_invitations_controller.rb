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
        puts "PARAMS: #{trip_invitation_params}"
        created_invitations = []

        JSON.parse(trip_invitation_params[:invitee_uuids]).each do |uuid|
            @trip_invitation = TripInvitation.new({trip_id: trip_invitation_params[:trip_id], issuer_id: trip_invitation_params[:issuer_id], invitee_id: User.find_by(uuid: uuid).id})

            if @trip_invitation.save
                created_invitations << @trip_invitation
            else
                created_invitations << @trip_invitation.errors
            end
        end

        render json: created_invitations
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
        params.require(:trip_invitation).permit(:trip_id, :issuer_id, :invitee_uuids, :accepted)
    end
end