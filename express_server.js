var app = require('express').createServer(),
    io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
    sys = require('sys'),
    express = require('express');

app.configure(function() {
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
  app.set("views", __dirname + "/views");
  app.set('view engine', 'ejs');
});

var world = {
  "clients" : {}
}

app.get("/", function(req, res) {
  res.render("index", {"layout":false});
});

app.listen(3000);

// socket.io 
var socket = io.listen(app); 
setInterval(function() {
  socket.broadcast(world);
}, 1000);
socket.on('connection', function(client){ 
  // new client is here! 
  sys.puts("A new client just connected. Welcome it!")

  world.clients[client.sessionId] = {"x" : 0, "y" : 0};
  
  client.on('message', function(message) {
    sys.puts("We got a message: " + message);
    switch(message.command) {
      case 'move':
        world.clients[client.sessionId]["x"] = message.x;
        world.clients[client.sessionId]["y"] = message.y;
      break;

      default:
        client.send("Your message is returned to you: " + message);
    }
  });
  client.on('disconnect', function() {
    sys.puts("Bye, bye!");
  });
}); 
