// setup server and ports
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// listen and log when a client connects
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// find our files
app.use(express.static('public'));

// when a client connects broadcast to all other clients
io.on("connection", socket => {
  socket.emit("message", "You Connected");
  socket.broadcast.emit("message", "A new user has joined");
  console.log("new user connected")
  // when a client disconnects broadcast to all other clients
  socket.on('disconnect', () => {
    io.emit("message", "A User Has Left");
  });
});