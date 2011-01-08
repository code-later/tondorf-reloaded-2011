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

app.get("/", function(req, res) {
  res.render("index", {"layout":false});
});

app.listen(3000);

// socket.io 
var socket = io.listen(app); 
socket.on('connection', function(client){ 
  // new client is here! 
  sys.puts("A new client just connected. Welcome it!")
  client.on('message', function(message) {
    sys.puts("We got a message: " + message);
    switch(message) {
      case 'broadcast':
        socket.broadcast("This is a broadcast.");
      break;

      default:
        client.send("Your message is returned to you: " + message);
    }
  });
  client.on('disconnect', function() {
    sys.puts("Bye, bye!");
  });
}); 
