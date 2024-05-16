class CreateDistances < ActiveRecord::Migration[7.0]
  def change
    create_table :distances do |t|
      t.string :origin
      t.string :destination
      t.string :distance
      t.string :duration
      
      t.timestamps
    end
  end
end
