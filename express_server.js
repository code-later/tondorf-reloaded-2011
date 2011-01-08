var app         = require('express').createServer(),
    io          = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io')
    sys         = require('sys'),
    express     = require('express');
    grasshopper = require('./lib/grasshopper');

var game = new grasshopper.Game();
var socket = io.listen(app);
var knownClients = [];

app.configure(function() {
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
  app.set("views", __dirname + "/views");
  app.set('view engine', 'ejs');
});

app.get("/", function(req, res) {
  res.render("index", {"layout":false});
});

app.get("/world", function(req, res) {
  res.writeHead(200, { "Content-Type" : "application/json"});
  sys.puts("Registered client to consume world data.");
  knownClients.push(res);
});

app.put("/players/:name", function(req, res) {
  var player = game.addPlayer({ip: req.headers.ip, name: req.params.name})
  sys.puts("Added player: " + player.name);
  res.writeHead(200, { "Content-Type" : "application/json"});
  sys.puts("Current World: " + game.world);
  res.write(JSON.stringify({"ok":true}));
  res.end();
});

app.listen(3000);

socket.on('connection', function(client) { 
  sys.puts("A new client just connected. Welcome it!")

  client.on('message', function(message) {});
  client.on('disconnect', function() {});
});

setInterval(function() {
  game.turn();
  socket.broadcast(game.world);
  var jsonWorld = JSON.stringify(game.world);
  knownClients.forEach(function(res) {
    res.write(jsonWorld);
  });
}, grasshopper.WorldDefs.tick);
