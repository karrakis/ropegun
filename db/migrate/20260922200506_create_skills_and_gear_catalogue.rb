class CreateSkillsAndGearCatalogue < ActiveRecord::Migration[7.0]
  def change
    # ── Shared skill catalogue ──────────────────────────────────────────────
    create_table :skills do |t|
      t.string :name, null: false
      t.string :category, null: false
      t.string :description
      t.timestamps
    end
    add_index :skills, :name, unique: true
    add_index :skills, :category

    # ── Shared gear catalogue ───────────────────────────────────────────────
    create_table :gear_items do |t|
      t.string :name, null: false
      t.string :category, null: false
      t.string :description
      t.timestamps
    end
    add_index :gear_items, :name, unique: true
    add_index :gear_items, :category

    # ── User ↔ Skill (with proficiency) ────────────────────────────────────
    create_table :user_skills do |t|
      t.references :user, null: false, foreign_key: true
      t.references :skill, null: false, foreign_key: true
      t.integer :proficiency, null: false, default: 0  # enum: competent/rusty/learning
      t.timestamps
    end
    add_index :user_skills, [:user_id, :skill_id], unique: true

    # ── User ↔ Gear (with quantity) ─────────────────────────────────────────
    create_table :user_gear_items do |t|
      t.references :user, null: false, foreign_key: true
      t.references :gear_item, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.timestamps
    end
    add_index :user_gear_items, [:user_id, :gear_item_id], unique: true

    # ── Trip memberships (replaces trips_users + trip_invitations logic) ────
    create_table :trip_memberships do |t|
      t.references :trip, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :role, null: false, default: 0  # enum: owner/member/invited
      t.boolean :accepted, null: false, default: false
      t.datetime :invited_at
      t.datetime :joined_at
      t.timestamps
    end
    add_index :trip_memberships, [:trip_id, :user_id], unique: true

    # ── Skills committed to a trip by a user ────────────────────────────────
    create_table :trip_skills do |t|
      t.references :trip, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :skill, null: false, foreign_key: true
      t.timestamps
    end
    add_index :trip_skills, [:trip_id, :user_id, :skill_id], unique: true

    # ── Gear committed to a trip by a user ──────────────────────────────────
    create_table :trip_gear_items do |t|
      t.references :trip, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :gear_item, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.timestamps
    end
    add_index :trip_gear_items, [:trip_id, :user_id, :gear_item_id], unique: true

    # ── Trip additions ───────────────────────────────────────────────────────
    add_column :trips, :starts_on, :date
    add_column :trips, :ends_on, :date
    add_column :trips, :share_token, :uuid, default: -> { "gen_random_uuid()" }, null: false
    add_column :trips, :guest_list, :jsonb, default: []
    add_column :trips, :extra_data, :jsonb, default: {}
    add_index :trips, :share_token, unique: true

    # ── trips_locations: add position for route ordering ────────────────────
    add_column :trips_locations, :position, :integer, default: 0

    # ── Location: weather caching ────────────────────────────────────────────
    add_column :locations, :weather, :jsonb
    add_column :locations, :weather_source, :string
    add_column :locations, :weather_last_updated, :datetime

    # ── Remove old skill columns from users (replaced by user_skills) ────────
    remove_column :users, :top_rope_belay, :integer
    remove_column :users, :lead_belay, :integer
    remove_column :users, :tr_indoor_climb_grade, :string
    remove_column :users, :tr_outdoor_climb_grade, :string
    remove_column :users, :lead_climb_indoor_grade, :string
    remove_column :users, :lead_climb_outdoor_grade, :string
    remove_column :users, :trad_lead, :integer
    remove_column :users, :trad_climb_outdoor_grade, :string
    remove_column :users, :multipitch, :integer
  end
end
