// setup server and ports
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

//initialize player counts on each server
let players = [0, 0, 0, 0];

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
  
  // when a client joins a room let us know
  socket.on("userJoined", room => {
    players[room]++;
    console.log("player joined from " + room + ". Now there are " + players[room] + " players;")
  });
  
  // when a client disconnects broadcast to all other clients
  socket.on('disconnect', () => {
    io.emit("message", "A User Has Left");
  });
});