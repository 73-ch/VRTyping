module ApplicationCable
  class Connection < ActionCable::Connection::Base
    def connect
      @num = cookies.encrypted[Rails.application.config.session_options[:key]][:num]
    end
  end
end
