class ChangeDiscoverableBySearchDefaultToTrue < ActiveRecord::Migration[7.0]
  # Defaulted to false when this shipped, which meant two users could both
  # have accounts and still never find each other unless they happened to
  # dig up the opt-in checkbox first — this flips it to opt-out instead.
  # Existing users who are still sitting at the (old) default get the new
  # default applied too; anyone who's already made an explicit choice either
  # way already has a row that looks identical to "still at the default", so
  # there's no way to distinguish the two for a boolean column — but since
  # this only shipped a couple days ago, that's an acceptable tradeoff here.
  def up
    change_column_default :users, :discoverable_by_search, from: false, to: true
    User.where(discoverable_by_search: false).update_all(discoverable_by_search: true)
  end

  def down
    change_column_default :users, :discoverable_by_search, from: true, to: false
  end
end
