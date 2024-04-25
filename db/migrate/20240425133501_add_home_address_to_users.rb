class AddHomeAddressToUsers < ActiveRecord::Migration[7.0]
  def up
    add_column :users, :home_address, :string
  end

  def down
    remove_column :users, :home_address
  end
end
