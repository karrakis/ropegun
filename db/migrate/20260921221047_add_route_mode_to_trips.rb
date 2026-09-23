class AddRouteModeToTrips < ActiveRecord::Migration[7.0]
  def change
    add_column :trips, :route_mode, :boolean
  end
end
