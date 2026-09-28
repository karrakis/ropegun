class AddProfileVisibilityToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :profile_visibility, :jsonb, default: {}, null: false
  end
end
