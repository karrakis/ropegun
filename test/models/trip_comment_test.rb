require "test_helper"

class TripCommentTest < ActiveSupport::TestCase
  test "requires a body" do
    comment = TripComment.new(trip: trips(:alpine_trip), user: users(:alice))
    assert_not comment.valid?
    assert_includes comment.errors[:body], "can't be blank"
  end

  test "belongs to a trip and a user" do
    comment = trip_comments(:alpine_trip_first_comment)
    assert_equal trips(:alpine_trip), comment.trip
    assert_equal users(:bob), comment.user
  end
end
