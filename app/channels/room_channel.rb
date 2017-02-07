class RoomChannel < ApplicationCable::Channel
  def subscribed
    stream_from params[:num]
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def keyPressed(data)
    ActionCable.server.broadcast "#{params[:num]}", key: data['key']
  end

end
