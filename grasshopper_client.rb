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

  def join
    Yajl::HttpStream.get(URI.parse("http://#{server}/world")) do |world|
      self.world = world
      think
      update_player
    end
  end
  
  def run
    @player[:actions][:thrust] = true
  end
  
  def running?
    @player[:actions][:thrust]
  end
  
  def stop
    @player[:actions][:thrust] = false
  end
  
  def turn_left
    @player[:actions][:turnLeft] = true
    @player[:actions][:turnRight] = false
  end
  
  def turning_left?
    @player[:actions][:turnLeft]
  end
  
  def turn_right
    @player[:actions][:turnLeft] = false
    @player[:actions][:turnRight] = true
  end
  
  def turning_right?
    @player[:actions][:turnRight]
  end
  
  def turning?
    turning_left? || turning_right?
  end
  
  def stop_turning
    @player[:actions][:turnLeft] = false
    @player[:actions][:turnRight] = false
  end
  
  def fire
    @player[:actions][:fire] = true
  end
  
  def fire?
    @player[:actions][:fire]
  end
  
  def cease_fire
    @player[:actions][:fire] = false
  end

  %w(run stop turn_left turn_right stop_turning fire cease_fire).each do |meth_name|
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
