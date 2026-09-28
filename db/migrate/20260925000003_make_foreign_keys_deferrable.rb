class MakeForeignKeysDeferrable < ActiveRecord::Migration[7.0]
  # The local dev/test Postgres role is not a superuser, so Rails' fixture
  # loader can't disable referential-integrity triggers to bulk-insert
  # fixtures out of dependency order (see config/environments/test.rb for
  # the related `verify_foreign_keys_for_fixtures` note). Making these FKs
  # DEFERRABLE INITIALLY DEFERRED tells Postgres itself to only check them
  # at transaction commit, which fixes fixture loading regardless of role
  # privileges and has no effect on runtime behavior/perf otherwise.
  FOREIGN_KEYS = [
    ["trip_gear_items", "gear_items", {}],
    ["trip_gear_items", "trips", {}],
    ["trip_gear_items", "users", {}],
    ["trip_memberships", "trips", {}],
    ["trip_memberships", "users", {}],
    ["trip_skills", "skills", {}],
    ["trip_skills", "trips", {}],
    ["trip_skills", "users", {}],
    ["trips", "users", { column: "owner_id" }],
    ["trips_locations", "locations", {}],
    ["trips_locations", "trips", {}],
    ["trips_users", "trips", {}],
    ["trips_users", "users", {}],
    ["user_gear_items", "gear_items", {}],
    ["user_gear_items", "users", {}],
    ["user_skills", "skills", {}],
    ["user_skills", "users", {}],
  ].freeze

  def up
    FOREIGN_KEYS.each do |from_table, to_table, options|
      remove_foreign_key from_table, to_table, **options
      add_foreign_key from_table, to_table, **options, deferrable: :deferred
    end
  end

  def down
    FOREIGN_KEYS.each do |from_table, to_table, options|
      remove_foreign_key from_table, to_table, **options
      add_foreign_key from_table, to_table, **options
    end
  end
end
