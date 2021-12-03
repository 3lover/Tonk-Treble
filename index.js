// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static('public'));

io.on("connection", socket => {
  socket.emit("message", "You Connected");
  console.log("new user connected")
  
  socket.on('disconnect', () => {
    io.emit("message", "A User Has Left");
  });
});