# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2026_09_22_200506) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "distances", force: :cascade do |t|
    t.string "origin"
    t.string "destination"
    t.string "distance"
    t.string "duration"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "feedbacks", force: :cascade do |t|
    t.string "title"
    t.string "body"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "friendships", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "friend_id"
    t.boolean "accepted", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "friend_id"], name: "index_friendships_on_user_id_and_friend_id", unique: true
  end

  create_table "gear_items", force: :cascade do |t|
    t.string "name", null: false
    t.string "category", null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_gear_items_on_category"
    t.index ["name"], name: "index_gear_items_on_name", unique: true
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.string "latitude"
    t.string "longitude"
    t.string "office"
    t.integer "office_x"
    t.integer "office_y"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "weather"
    t.string "weather_source"
    t.datetime "weather_last_updated"
    t.index ["latitude", "longitude"], name: "index_locations_on_latitude_and_longitude", unique: true
    t.index ["name"], name: "index_locations_on_name"
    t.index ["office"], name: "index_locations_on_office"
  end

  create_table "skills", force: :cascade do |t|
    t.string "name", null: false
    t.string "category", null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_skills_on_category"
    t.index ["name"], name: "index_skills_on_name", unique: true
  end

  create_table "trip_gear_items", force: :cascade do |t|
    t.bigint "trip_id", null: false
    t.bigint "user_id", null: false
    t.bigint "gear_item_id", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["gear_item_id"], name: "index_trip_gear_items_on_gear_item_id"
    t.index ["trip_id", "user_id", "gear_item_id"], name: "index_trip_gear_items_on_trip_id_and_user_id_and_gear_item_id", unique: true
    t.index ["trip_id"], name: "index_trip_gear_items_on_trip_id"
    t.index ["user_id"], name: "index_trip_gear_items_on_user_id"
  end

  create_table "trip_invitations", force: :cascade do |t|
    t.bigint "trip_id"
    t.bigint "issuer_id"
    t.bigint "invitee_id"
    t.boolean "accepted", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["trip_id", "issuer_id", "invitee_id"], name: "index_trip_invitations_on_trip_id_and_issuer_id_and_invitee_id", unique: true
  end

  create_table "trip_memberships", force: :cascade do |t|
    t.bigint "trip_id", null: false
    t.bigint "user_id", null: false
    t.integer "role", default: 0, null: false
    t.boolean "accepted", default: false, null: false
    t.datetime "invited_at"
    t.datetime "joined_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["trip_id", "user_id"], name: "index_trip_memberships_on_trip_id_and_user_id", unique: true
    t.index ["trip_id"], name: "index_trip_memberships_on_trip_id"
    t.index ["user_id"], name: "index_trip_memberships_on_user_id"
  end

  create_table "trip_skills", force: :cascade do |t|
    t.bigint "trip_id", null: false
    t.bigint "user_id", null: false
    t.bigint "skill_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["skill_id"], name: "index_trip_skills_on_skill_id"
    t.index ["trip_id", "user_id", "skill_id"], name: "index_trip_skills_on_trip_id_and_user_id_and_skill_id", unique: true
    t.index ["trip_id"], name: "index_trip_skills_on_trip_id"
    t.index ["user_id"], name: "index_trip_skills_on_user_id"
  end

  create_table "trips", force: :cascade do |t|
    t.bigint "owner_id"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "route_mode"
    t.date "starts_on"
    t.date "ends_on"
    t.uuid "share_token", default: -> { "gen_random_uuid()" }, null: false
    t.jsonb "guest_list", default: []
    t.jsonb "extra_data", default: {}
    t.index ["share_token"], name: "index_trips_on_share_token", unique: true
  end

  create_table "trips_locations", id: false, force: :cascade do |t|
    t.bigint "trip_id"
    t.bigint "location_id"
    t.integer "position", default: 0
    t.index ["location_id"], name: "index_trips_locations_on_location_id"
    t.index ["trip_id", "location_id"], name: "index_trips_locations_on_trip_id_and_location_id", unique: true
    t.index ["trip_id"], name: "index_trips_locations_on_trip_id"
  end

  create_table "trips_users", id: false, force: :cascade do |t|
    t.bigint "trip_id"
    t.bigint "user_id"
    t.index ["trip_id", "user_id"], name: "index_trips_users_on_trip_id_and_user_id", unique: true
    t.index ["trip_id"], name: "index_trips_users_on_trip_id"
    t.index ["user_id"], name: "index_trips_users_on_user_id"
  end

  create_table "user_gear_items", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "gear_item_id", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["gear_item_id"], name: "index_user_gear_items_on_gear_item_id"
    t.index ["user_id", "gear_item_id"], name: "index_user_gear_items_on_user_id_and_gear_item_id", unique: true
    t.index ["user_id"], name: "index_user_gear_items_on_user_id"
  end

  create_table "user_skills", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "skill_id", null: false
    t.integer "proficiency", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["skill_id"], name: "index_user_skills_on_skill_id"
    t.index ["user_id", "skill_id"], name: "index_user_skills_on_user_id_and_skill_id", unique: true
    t.index ["user_id"], name: "index_user_skills_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.text "about_me"
    t.text "additional_information"
    t.text "auth0_sub"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "home_address"
    t.uuid "uuid", default: -> { "gen_random_uuid()" }, null: false
    t.index ["uuid"], name: "index_users_on_uuid", unique: true
  end

  add_foreign_key "trip_gear_items", "gear_items"
  add_foreign_key "trip_gear_items", "trips"
  add_foreign_key "trip_gear_items", "users"
  add_foreign_key "trip_memberships", "trips"
  add_foreign_key "trip_memberships", "users"
  add_foreign_key "trip_skills", "skills"
  add_foreign_key "trip_skills", "trips"
  add_foreign_key "trip_skills", "users"
  add_foreign_key "trips", "users", column: "owner_id"
  add_foreign_key "trips_locations", "locations"
  add_foreign_key "trips_locations", "trips"
  add_foreign_key "trips_users", "trips"
  add_foreign_key "trips_users", "users"
  add_foreign_key "user_gear_items", "gear_items"
  add_foreign_key "user_gear_items", "users"
  add_foreign_key "user_skills", "skills"
  add_foreign_key "user_skills", "users"
end
