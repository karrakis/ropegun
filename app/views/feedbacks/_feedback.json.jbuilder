json.extract! feedback, :id, :title, :body, :email, :created_at, :updated_at
json.url feedback_url(feedback, format: :json)
