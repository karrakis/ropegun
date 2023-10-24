class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :email
      t.string :name
      t.integer :top_rope_belay
      t.integer :lead_belay
      t.string :tr_indoor_climb_grade
      t.string :tr_outdoor_climb_grade
      t.string :lead_climb_indoor_grade
      t.string :lead_climb_outdoor_grade
      t.integer :trad_lead
      t.string :trad_climb_outdoor_grade
      t.integer :multipitch
      t.text :about_me
      t.text :additional_information
      t.text :auth0_sub

      t.timestamps
    end
  end
end
