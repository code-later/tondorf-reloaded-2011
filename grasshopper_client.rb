require "rubygems"
require 'yajl'
require 'yajl/http_stream'
require "httparty"

require "active_support/inflector"

require "pp"

class Grasshopper
  include HTTParty
  
  attr_accessor :world, :server

  def self.join(server, nick, &block)
    game = new(server, nick)
    Yajl::HttpStream.get(URI.parse("http://#{server}/world")) do |world|
      game.world = world
      game.instance_eval(&block)
      game.update_player
    end
  end

  def initialize(server, nick)
    @player = {:nick => nick, :actions => {:thrust => false, :turnLeft => false, :turnRight => false, :fire => false}}
    @server = server
    self.class.post("http://#{@server}/players/#{@player[:nick]}")
  end

  def run!
    @player[:actions][:thrust] = true
  end
  def stop!
    @player[:actions][:thrust] = false
  end
  def turn_left!
    @player[:actions][:turn_left] = true
    @player[:actions][:turn_right] = false
  end
  def turn_right!
    @player[:actions][:turn_left] = false
    @player[:actions][:turn_right] = true
  end
  def stop_turning!
    @player[:actions][:turn_left] = false
    @player[:actions][:turn_right] = false
  end
  def shoot!
    @player[:actions][:shoot] = true
  end
  def cease_fire!
    @player[:actions][:shoot] = false
  end
  
  def update_player
    puts "Sending #{@player.inspect} to http://#{@server}/players/#{@player[:nick]}"
    self.class.put("http://#{@server}/players/#{@player[:nick]}", :body => Yajl::Encoder.encode(@player))
  end
end



# require "grashopper"

Grasshopper.join("gambit.local:3000", "basti") do
  world
  
  run!
  # stop!
  # 
  turn_left!
  # turn_right!
  # stop_turning!
  # 
  # shoot!
  # cease_fire!
end
