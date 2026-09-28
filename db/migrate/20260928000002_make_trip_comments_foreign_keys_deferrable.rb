class MakeTripCommentsForeignKeysDeferrable < ActiveRecord::Migration[7.0]
  # `t.references ..., foreign_key: { deferrable: :deferred }` in the
  # CreateTripComments migration did not actually apply the deferrable
  # option (confirmed via schema.rb), unlike the hash-free `deferrable:`
  # kwarg used directly on `add_foreign_key` in
  # MakeForeignKeysDeferrable. Redone explicitly here so fixture loading
  # works the same way it does for the other trip-related tables (see the
  # comment on that migration for the full rationale).
  FOREIGN_KEYS = [
    ["trip_comments", "trips", {}],
    ["trip_comments", "users", {}],
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
