class DropUsersLocationsTable < ActiveRecord::Migration[7.0]
  def change
    drop_table :user_linked_locations
  end
end
