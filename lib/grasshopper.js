var sys = require("sys");

var gameInstance = new Game();
var getGame = function() {
  return gameInstance;
}

var getUUID = function() {
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


var WorldDefs = {
  size:           1000, // m
  serverTick:     100,   // ms
  speed:          50,   // m/s
  rotationSpeed:  0.5 * Math.PI,
  shotSpeed:      200,
  shotTimeToLife: 70, // * 0.2,
  playerSize:     4,// m

  gameTick: function() {
    return this.serverTick / 1000.0;
  }
  
};

function Shot(position, direction, playerId) {
  this.id        = getUUID();
  this.position  = position;
  this.direction = direction;
  this.playerId  = playerId;
  this.life      = WorldDefs.shotTimeToLife;

  this.flyAndKill = function() {
    if (this.life > 0) {
      var ahead = (new Vector2D(1,0)).norm().rotate(this.direction);
      this.position = this.position.add(ahead.mul(WorldDefs.gameTick()).mul(WorldDefs.shotSpeed));
      this.life--;
    } else {
      delete getGame().world.shotMap[this.playerId];
      return;
    };
  }

  this.collidedWith = function(obstacle) {
    this.life = 0;
    if (obstacle instanceof Player) {
      var playerId = this.playerId;
      getGame().world.players.forEach(function (player) {
        if (player.id == playerId) { 
          player.score++;
          return;
        };
      });
    };
  };
}

function Player(attributes) {
  this.id        = getUUID();
  this.name      = attributes.name;
  this.ip        = attributes.ip;
  this.score     = 0;
  this.shotDown  = false;
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
    if (this.shotDown) {
      this.shotDown = false;
      this.position = (new Vector2D(WorldDefs.size * Math.random(), WorldDefs.size * Math.random())).norm();
      this.direction = (Math.random() * Math.PI * 2);

      this.actions = {
        thrust: false,
        turnLeft: false,
        turnRight: false,
        fire: false
      }
      
      return;
    };

    var ahead = (new Vector2D(1,0)).norm().rotate(this.direction);
    if (this.actions.thrust) {
      var newPosition = this.position.add(ahead.mul(WorldDefs.gameTick()).mul(WorldDefs.speed)); 
      this.position = newPosition;
    };
    if (this.actions.turnLeft) { this.direction -= WorldDefs.gameTick() * WorldDefs.rotationSpeed };
    if (this.actions.turnRight) { this.direction += WorldDefs.gameTick() * WorldDefs.rotationSpeed };

    if (this.actions.fire) {
      getGame().fireShot(this);
    };
  };

  this.collidedWith = function(obstacle) {
    this.shotDown = true;
    this.score--;
  };
}

function Game() {
  this.world = new World();
  
  this.addPlayer = function(attributes) {
    attributes.position = (new Vector2D(WorldDefs.size * Math.random(), WorldDefs.size * Math.random())).norm();
    attributes.direction = (Math.random() * Math.PI * 2);
    var newPlayer = new Player(attributes);

    if (this.world.playerExists(newPlayer.name)) {
      throw "Duplicate Player";
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

  this.fireShot = function(shooter) {
    if (this.world.shotMap[shooter.id]) { 
      return;
    } else {
      this.world.shotMap[shooter.id] = new Shot(shooter.position, shooter.direction, shooter.id);
    };
  };

  this.turn = function() {
    this.world.players.forEach(function (player) {
      player.performActions();
    });
    this.world.shotList().forEach(function(shot) {
      shot.flyAndKill();
    });
    this.world.detectCollisions();
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

  this.sub = function(vector) {
    return (new Vector2D(this.x - vector.x, this.y - vector.y)).norm();
  };

  this.mul = function(multiplier) {
    if (multiplier instanceof Vector2D) { 
      return this.x * vector.x + this.y * vector.y;
    } else {
      return (new Vector2D(this.x * multiplier, this.y * multiplier)).norm();
    };
  };

  this.length = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  };

  this.rotate = function(rad) {
    return (new Vector2D(this.x * Math.cos(rad) - this.y * Math.sin(rad),
                         this.x * Math.sin(rad) + this.y * Math.cos(rad))).norm();
  };


} 

function World() {
  this.players = [];
  this.shotMap = {};

  this.playerExists = function(playerName) {
    var duplicatePlayer = false;

    this.players.forEach(function (player) {
      if (player.name == playerName) {
        duplicatePlayer = true;
        return;
      };
    })
    return duplicatePlayer;
  };

  this.shotList = function() {
    var myShotMap = this.shotMap;
    return Object.keys(myShotMap).map(function (shotId) {
      return myShotMap[shotId];
    })
  };

  this.detectCollisions = function() {
    var obstacles = this.players.concat(this.shotList());

    obstacles.forEach(function (obstacle1) {
      obstacles.forEach(function (obstacle2) {
        if ((obstacle1.position.sub(obstacle2.position)).length() < WorldDefs.playerSize*2) { 
          if (obstacle1.id != obstacle2.id) {
            sys.log("Hit! " + obstacle1 + " > " + obstacle2);
            obstacle1.collidedWith(obstacle2);
            obstacle2.collidedWith(obstacle1);
          };
        };
      })
    });
  }
}

module.exports.Game      = Game;
module.exports.getGame   = getGame;
module.exports.resetGame = function() {
  var gameInstance = new Game();
  return gameInstance;
};
module.exports.WorldDefs = WorldDefs;
