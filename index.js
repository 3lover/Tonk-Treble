// setup server and ports
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

// get our personal requires
const util = require('./public/util.js');

// initialize player counts on each server
let players = [0, 0, 0, 0];

// initialize stuff
let basesize = 1000;
let entities = [];

// listen and log when a client connects
server.listen(port, function () {
  util.log('Server listening at port ' + port);
});

// find our files
app.use(express.static('public'));


// the entity class
class Entity {
  // set if it is bound to a client, the lobby, and the type of entity it is
  constructor(client = null, lobby = 0, type = "t") {
    // server values
    this.client = client;
    this.lobby = lobby;
    this.type = type;
    this.host = false;
    // game values
    this.x = Math.floor(Math.random() * basesize);
    this.y = Math.floor(Math.random() * basesize);
    this.rotation = 0;
  }
}

// when a client connects
io.on("connection", socket => {
  // when we recieve a message log it
  socket.on("message", data => {
    util.log(`'${data}' recieved from ${socket.id}`)
  });
  
  // when a client joins a room create a player instance
  socket.on("userJoined", room => {
    socket.join(room);
    players[room]++;
    let e = new Entity(socket.id, room, "t");
    if (players[room] == 1) e.host = true;
    entities.push(e);
  });
  
  // when a client leaves a room remove their player
  socket.on("userLeft", room => {
    for (let i in entities) {
      if (entities[i].client === socket.id) {
        players[entities[i].lobby]--;
        entities.splice(i, 1);
        break;
      }
    }
    util.log(`${players[room]} remaining in room ${room}`);
  });
  
  // when a client disconnects check if they are in a room and if so remove their object
  socket.on('disconnect', () => {
    for (let i in entities) {
      if (entities[i].client === socket.id) {
        players[entities[i].lobby]--;
        util.log(`${players[entities[i].lobby]} remaining in room ${entities[i].lobby}`);
        entities.splice(i, 1);
        break;
      }
    }
  });
});

// run the server side of it for each lobby
for (let i = 0; i < players.length; i++) {
  let renderdata = [];
  for (let j = 0; j < players[i]; j++) {
    renderdata.push({
      sides: 4,
      x: 50,
      y: 50 + (j * 100),
      width: 50,
      height: 50
    });
  }
  io.to(i)
}