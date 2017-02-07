Rails.application.routes.draw do
  get "home/:num" => "home#home"
  get "desk" => "home#desk"


  mount ActionCable.server => '/cable'
end
