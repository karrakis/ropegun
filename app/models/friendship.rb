class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: 'User'

  validates :friend_id, uniqueness: { scope: :user_id, message: "already have a pending or accepted friendship" }

  scope :accepted, -> { where(accepted: true) }
    scope :pending, -> { where(accepted: false) }
    
  def accept
      update(accepted: true)
  end

  def decline
      destroy
  end

  def cancel
      destroy
  end
end