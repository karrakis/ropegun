class TripInvitationsController < ApplicationController
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
        puts "PARAMS: #{trip_invitation_params}"
        trip_invitations = TripInvitation.where(trip_id: trip_invitation_params[:trip_id], invitee_id: trip_invitation_params[:invitee_id])

        results = []
        puts "TRIP INVITATIONS: #{trip_invitations}"
        trip_invitations.each do |trip_invitation|
            puts "TRIP INVITATION: #{trip_invitation}"
            if trip_invitation.update(accepted: trip_invitation_params[:accepted])
                results << trip_invitation
            else
            end
        end

        if results.length > 0
            render json: trip_invitations.first
        else
            render json: {error: "Something went wrong"}
        end
    end

    def destroy
        @trip_invitation.destroy
        redirect_to trip_invitations_url, notice: 'Trip invitation was successfully destroyed.'
    end

    private

    def trip_invitation_params
        params.require(:trip_invitation).permit(:trip_id, :issuer_id, :invitee_uuids, :invitee_id, :accepted)
    end
end