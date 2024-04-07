class CreateLocations < ActiveRecord::Migration[7.0]
  def change
    create_table :locations do |t|
      t.string :name
      t.string :latitude
      t.string :longitude
      t.string :office
      t.number :office_x
      t.number :office_y
    
      t.belongs_to :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
