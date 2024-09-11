class CreateUserLinkedLocations < ActiveRecord::Migration[7.0]
  def change
    create_table :user_linked_locations do |t|
      t.integer :user_id
      t.integer :location_id

      t.timestamps
    end
  end
end
