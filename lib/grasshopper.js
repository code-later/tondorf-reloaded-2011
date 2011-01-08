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
  //this.position  = attributes.random_position;
  this.position  = 0;
  //this.direction = attributes.random_direction;
  this.direction = 1;
  this.actions   = {
    thrust: false,
    turnLeft: false,
    turnRight: false,
    fire: false
  };

  this.performActions = function() {
    var ahead = Vector2D.norm().rotate(this.direction);
    if (this.thrust) { this.position += ahead * World.tick * World.speed };
    if (this.turnLeft) { this.direction -= World.tick * World.rotationSpeed };
    if (this.turnRight) { this.direction += World.tick * World.rotationSpeed };
  }
}

function Game() {
  this.world = new World();
  
  this.addPlayer = function(attributes) {
    var newPlayer = new Player(attributes);
    this.world.players.push(newPlayer);

    return newPlayer;
  };

  this.turn = function() {
    // ... to be implemented
  };
}

function Vector2D() {
} 

function World() {
  this.players = [];
}

module.exports.Game = Game;
