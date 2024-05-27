class CreateTrips < ActiveRecord::Migration[7.0]
  def up
    create_table :trips do |t|
      t.bigint :owner_id
      t.string :name

      t.timestamps
    end

    add_foreign_key :trips, :users, column: :owner_id

    create_table :trips_users, id: false do |t|
      t.belongs_to :trip
      t.belongs_to :user
    end

    add_index :trips_users, [:trip_id, :user_id], unique: true

    create_table :trips_locations, id: false do |t|
      t.belongs_to :trip
      t.belongs_to :location
    end

    add_index :trips_locations, [:trip_id, :location_id], unique: true

    add_foreign_key :trips_users, :trips
    add_foreign_key :trips_users, :users

    add_foreign_key :trips_locations, :trips
    add_foreign_key :trips_locations, :locations
  end

  def down
    drop_table :trips
    drop_table :trips_users
    drop_table :trips_locations
  end
end
