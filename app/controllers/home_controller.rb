require 'securerandom'
class HomeController < ApplicationController
  def home
  end

  def desk
    @num = SecureRandom.hex(2)
    params[:num] = @num
  end
end
