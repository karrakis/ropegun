class TripsController < ApplicationController
  def public_show
    @trip = Trip.find_by!(share_token: params[:share_token])
    @user = session[:userinfo]
    @local_user = @user ? User.find_by(auth0_sub: @user["sub"]) : nil
  end

  # Logged-in user joins via share link
  def join
    @trip = Trip.find_by!(share_token: params[:share_token])
    local_user = current_user ? User.find_by(auth0_sub: session[:userinfo]["sub"]) : nil
    return redirect_to login_path(return_to: "/trips/#{params[:share_token]}") unless local_user

    unless @trip.trip_memberships.exists?(user_id: local_user.id)
      @trip.trip_memberships.create!(
        user: local_user,
        role: :member,
        accepted: true,
        joined_at: Time.current
      )
    end
    redirect_to "/trips/#{params[:share_token]}", notice: "You've joined the trip!"
  end

  # When-is-good availability submission (logged-in or anonymous)
  def update_availability
    @trip = Trip.find_by!(share_token: params[:share_token])
    viewer_key = params[:viewer_key].to_s.strip
    return redirect_to "/trips/#{params[:share_token]}" if viewer_key.blank?

    selected = params[:selected_dates].to_s.split(",").map(&:strip).select { |d|
      d.match?(/\A\d{4}-\d{2}-\d{2}\z/)
    }

    availability = (@trip.extra_data&.dig("availability") || {}).dup
    availability[viewer_key] = selected

    @trip.update!(extra_data: (@trip.extra_data || {}).merge("availability" => availability))
    cal_month = params[:cal_month].presence
    redirect_url = "/trips/#{params[:share_token]}"
    redirect_url += "?cal_month=#{cal_month}" if cal_month&.match?(/\A\d{4}-\d{2}\z/)
    redirect_to redirect_url, notice: "Availability saved."
  end

  # Anonymous guest adds their name
  def add_guest
    @trip = Trip.find_by!(share_token: params[:share_token])
    name = params[:name].to_s.strip
    return redirect_to "/trips/#{params[:share_token]}" if name.blank?

    guest_list = @trip.guest_list || []
    unless guest_list.any? { |g| g["name"]&.downcase == name.downcase }
      guest_list << { "name" => name, "added_at" => Time.current.iso8601 }
      @trip.update!(guest_list: guest_list)
    end
    redirect_to "/trips/#{params[:share_token]}", notice: "You've been added to the trip."
  end
end

