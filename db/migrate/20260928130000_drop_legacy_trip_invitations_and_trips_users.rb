class DropLegacyTripInvitationsAndTripsUsers < ActiveRecord::Migration[7.0]
  def up
    # trips_users had deferrable FKs added in MakeForeignKeysDeferrable —
    # drop them explicitly first so drop_table doesn't fail on databases
    # where drop_table alone can't infer/remove them cleanly.
    remove_foreign_key :trips_users, :trips
    remove_foreign_key :trips_users, :users

    drop_table :trips_users
    drop_table :trip_invitations
  end

  def down
    create_table :trip_invitations do |t|
      t.bigint :trip_id
      t.bigint :issuer_id
      t.bigint :invitee_id
      t.boolean :accepted, default: false
      t.index [:trip_id, :issuer_id, :invitee_id], unique: true
      t.timestamps
    end

    create_table :trips_users, id: false do |t|
      t.bigint :trip_id
      t.bigint :user_id
    end
    add_index :trips_users, [:trip_id, :user_id], unique: true
    add_index :trips_users, :trip_id
    add_index :trips_users, :user_id
    add_foreign_key :trips_users, :trips, deferrable: :deferred
    add_foreign_key :trips_users, :users, deferrable: :deferred
  end
end
