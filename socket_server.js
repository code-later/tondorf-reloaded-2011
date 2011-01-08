var http = require('http'),  
    io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 
    sys = require('sys'),
    fs = require('fs');

var indexPage;

server = http.createServer(function(req, res){ 
 // your normal server code 
 res.writeHead(200, {'Content-Type': 'text/html'}); 
 res.write(indexPage);
 res.end();
});

fs.readFile("./index.html", function(err, data) {
  if (err) throw err;
  indexPage = data;
  server.listen(8080);
});
  
// socket.io 
var socket = io.listen(server); 
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

