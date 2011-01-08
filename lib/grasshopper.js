var sys = require("sys");

var WorldDefs = {
  size:           1000, // m
  serverTick:     100,  // ms
  speed:          10,   // m/s
  rotationSpeed:  2 * Math.PI,
  shotSpeed:      this.speed * 2,
  shotTimeToLife: this.size/this.shotSpeed * 0.2,
  playerSize:     1,// m

  gameTick: function() {
    return this.serverTick / 1000.0;
  }
};

function Player(attributes) {

  this.getUUID = function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789ABCDEF";
    for (var i = 0; i < 32; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

    var uuid = s.join("");
    return uuid;
  }

  this.id        = this.getUUID();
  this.name      = attributes.name;
  this.ip        = attributes.ip;
  this.position  = attributes.position;
  this.direction = attributes.direction;
  this.actions   = {
    thrust: false,
    turnLeft: false,
    turnRight: false,
    fire: false
  };

  this.newActions = function(actions) {
    this.actions.thrust     = actions.thrust;
    this.actions.turnLeft   = actions.turnLeft;
    this.actions.turnRight  = actions.turnRight;
    this.actions.fire       = actions.fire;
  };

  this.performActions = function() {
    var ahead = (new Vector2D(1,0)).norm().rotate(this.direction);
    if (this.actions.thrust) {
      var newPosition = this.position.add(ahead.mul(WorldDefs.gameTick()).mul(WorldDefs.speed)); 
      this.position = newPosition;
    };
    if (this.actions.turnLeft) { this.direction -= WorldDefs.gameTick() * WorldDefs.rotationSpeed };
    if (this.actions.turnRight) { this.direction += WorldDefs.gameTick() * WorldDefs.rotationSpeed };
  }
}

function Game() {
  this.world = new World();
  
  this.addPlayer = function(attributes) {
    attributes.position = (new Vector2D(WorldDefs.size * Math.random(), WorldDefs.size * Math.random())).norm();
    attributes.direction = (Math.random() * Math.PI * 2);
    var newPlayer = new Player(attributes);

    if (this.world.playerExists(newPlayer.name)) {
      throw "DuplicatePlayer";
    } else {
      this.world.players.push(newPlayer);
      return newPlayer;
    }
  };

  this.findPlayer = function(playerName) {
    var foundPlayer;

    this.world.players.forEach(function(player) {
      if (player.name == playerName) {
        foundPlayer = player;
        return;
      };
    });

    return foundPlayer;
  };

  this.turn = function() {
    this.world.players.forEach(function (player) {
      //sys.puts("Performing actions for: " + player.name);
      player.performActions();
    });
  };
}

function Vector2D(x, y) {
  this.x = x;
  this.y = y;

  this.fix = function(a) {
    return ((a % WorldDefs.size) + WorldDefs.size) % WorldDefs.size;
  };

  this.norm = function() {
    return new Vector2D(this.fix(this.x), this.fix(this.y));
  };

  this.add = function(vector) {
    return (new Vector2D(this.x + vector.x, this.y + vector.y)).norm();
  };

  //this.sub = function(vector) {
    //return (new Vector2D(this.x - vector.x, this.y - vector.y)).norm();
  //};

  this.mul = function(multiplier) {
    if (multiplier instanceof Vector2D) { 
      return this.x * vector.x + this.y * vector.y;
    } else {
      return (new Vector2D(this.x * multiplier, this.y * multiplier)).norm();
    };
  };

  this.rotate = function(rad) {
    return (new Vector2D(this.x * Math.cos(rad) - this.y * Math.sin(rad),
                         this.x * Math.sin(rad) + this.y * Math.cos(rad))).norm();
  };
} 

function World() {
  this.players = [];

  this.playerExists = function(playerName) {
    this.players.forEach(function (player) {
      if (player.name == playerName) { return true };
    })
    return false;
  };
}

module.exports.Game = Game;
module.exports.WorldDefs = WorldDefs;
