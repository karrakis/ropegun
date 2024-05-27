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

ActiveRecord::Schema[7.0].define(version: 2024_05_27_042526) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "distances", force: :cascade do |t|
    t.string "origin"
    t.string "destination"
    t.string "distance"
    t.string "duration"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.string "latitude"
    t.string "longitude"
    t.string "office"
    t.integer "office_x"
    t.integer "office_y"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "latitude", "longitude"], name: "index_locations_on_user_id_and_latitude_and_longitude", unique: true
    t.index ["user_id"], name: "index_locations_on_user_id"
  end

  create_table "trips", force: :cascade do |t|
    t.bigint "owner_id"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "trips_locations", id: false, force: :cascade do |t|
    t.bigint "trip_id"
    t.bigint "location_id"
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

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.integer "top_rope_belay"
    t.integer "lead_belay"
    t.string "tr_indoor_climb_grade"
    t.string "tr_outdoor_climb_grade"
    t.string "lead_climb_indoor_grade"
    t.string "lead_climb_outdoor_grade"
    t.integer "trad_lead"
    t.string "trad_climb_outdoor_grade"
    t.integer "multipitch"
    t.text "about_me"
    t.text "additional_information"
    t.text "auth0_sub"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "home_address"
  end

  add_foreign_key "locations", "users"
  add_foreign_key "trips", "users", column: "owner_id"
  add_foreign_key "trips_locations", "locations"
  add_foreign_key "trips_locations", "trips"
  add_foreign_key "trips_users", "trips"
  add_foreign_key "trips_users", "users"
end
