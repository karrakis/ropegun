class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: 'User'

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