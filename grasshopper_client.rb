require "rubygems"
require 'yajl'
require 'yajl/http_stream'
require "httparty"

require "active_support/inflector"

require "pp"

class Grasshopper
  include HTTParty
  
  attr_accessor :world, :server

  def self.join(server, nick)
    game = new(server, nick)
    if block_given?
      Yajl::HttpStream.get(URI.parse("http://#{server}/world")) do |world|
        game.world = world
        game.instance_eval(yield)
        game.update_player
      end
    end
    game
  end

  def initialize(server, nick)
    @player = {:nick => nick, :actions => {:thrust => false, :turnLeft => false, :turnRight => false, :fire => false}}
    @server = server
    begin
      self.class.post("http://#{@server}/players/#{@player[:nick]}")
    rescue => e
      puts "Could not connect to game-server"
      raise e
    end
  end

  def run
    @player[:actions][:thrust] = true
  end
  def stop
    @player[:actions][:thrust] = false
  end
  def turn_left
    @player[:actions][:turn_left] = true
    @player[:actions][:turn_right] = false
  end
  def turn_right
    @player[:actions][:turn_left] = false
    @player[:actions][:turn_right] = true
  end
  def stop_turning
    @player[:actions][:turn_left] = false
    @player[:actions][:turn_right] = false
  end
  def shoot
    @player[:actions][:shoot] = true
  end
  def cease_fire
    @player[:actions][:shoot] = false
  end

  %w(run stop turn_left turn_right stop_turning shoot cease_fire).each do |meth_name|
    define_method "#{meth_name}!" do
      send(meth_name)
      update_player
    end
  end
  
  def update_player
    puts "Sending #{@player.inspect} to http://#{@server}/players/#{@player[:nick]}"
    self.class.put("http://#{@server}/players/#{@player[:nick]}", :body => Yajl::Encoder.encode(@player))
  end
end



# require "grashopper"

# Grasshopper.join("localhost:3000", "andi1") do
#   world
#   
#   run
#   # stop!
#   # 
#   turn_left
#   # turn_right!
#   # stop_turning!
#   # 
#   # shoot!
#   # cease_fire!
# end

# p = Grasshopper.join("localhost:3000", "andi2")
# p.run!
# p.stop!
# p.turn_right!
