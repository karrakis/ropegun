class CreateTripInvitations < ActiveRecord::Migration[7.0]
  def change
    create_table :trip_invitations do |t|
      t.bigint :trip_id
      t.bigint :issuer_id
      t.bigint :invitee_id
      t.boolean :accepted, default: false

      t.index [:trip_id, :issuer_id, :invitee_id], unique: true

      t.timestamps
    end
  end
end
