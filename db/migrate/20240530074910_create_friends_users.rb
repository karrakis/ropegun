class CreateFriendsUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :friends_users do |t|
      t.bigint :user_id
      t.bigint :friend_id
      t.boolean :accepted, default: false

      t.index [:user_id, :friend_id], unique: true

      t.timestamps
    end
  end
end
