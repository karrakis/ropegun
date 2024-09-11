class RemoveUserIdFromLocations < ActiveRecord::Migration[7.0]
  def change
    remove_index :locations, name: "index_locations_on_user_id"
    remove_index :locations, name: "index_locations_on_user_id_and_latitude_and_longitude"
    remove_column :locations, :user_id, :integer
    add_index :locations, [:latitude, :longitude], unique: true
    add_index :locations, :office
    add_index :locations, :name
  end
end
