class CreateTripComments < ActiveRecord::Migration[7.0]
  def change
    create_table :trip_comments do |t|
      t.references :trip, null: false, foreign_key: { deferrable: :deferred }
      t.references :user, null: false, foreign_key: { deferrable: :deferred }
      t.text :body, null: false
      t.timestamps
    end
    add_index :trip_comments, [:trip_id, :created_at]
  end
end
