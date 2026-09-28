class AddDiscoverableBySearchToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :discoverable_by_search, :boolean, default: false, null: false
  end
end
