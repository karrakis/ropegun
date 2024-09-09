class CreateFeedbacks < ActiveRecord::Migration[7.0]
  def change
    create_table :feedbacks do |t|
      t.string :title
      t.string :body
      t.string :email

      t.timestamps
    end
  end
end
