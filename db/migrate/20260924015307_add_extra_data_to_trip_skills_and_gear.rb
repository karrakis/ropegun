class AddExtraDataToTripSkillsAndGear < ActiveRecord::Migration[7.0]
  def change
    add_column :trip_skills,     :extra_data, :jsonb, default: {}
    add_column :trip_gear_items, :extra_data, :jsonb, default: {}
    add_column :trip_gear_items, :required_quantity, :integer, default: 1
  end
end
