class AddArchivedAtToTrips < ActiveRecord::Migration[7.0]
  def change
    add_column :trips, :archived_at, :datetime
    add_index :trips, :archived_at
  end
end
