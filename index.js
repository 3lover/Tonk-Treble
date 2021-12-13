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

// initialize the screen proportions
let basesize = 1000;

//initialize an empty array of entities
let entities = [];

// listen and log when a client connects
server.listen(port, function () {
  console.log('Server listening at port ' + port);
});

// find our files
app.use(express.static('public'));


// the entity class
class Entity {
  // set if it is bound to a client, the lobby, and the type of entity it is
  constructor(client = null, lobby = 0, type = "t") {
    this.client = client;
    this.lobby = lobby;
    this.type = type;
    this.x = Math.floor(Math.random() * basesize);
    this.y = Math.floor(Math.random() * basesize);
  }
}

// when a client connects
io.on("connection", socket => {
  // when we recieve a message log it
  socket.on("message", data => {
    console.log(`'${data}' recieved from ${socket.id}`)
  });
  
  // when a client joins a room create a player instance
  socket.on("userJoined", room => {
    socket.join(room);
    players[room]++;
    let e = new Entity(socket.id, room, "t");
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
    console.log(`${players[room]} remaining in room ${room}`);
  });
  
  // when a client disconnects check if they are in a room and if so remove their object
  socket.on('disconnect', () => {
    for (let i in entities) {
      if (entities[i].client === socket.id) {
        players[entities[i].lobby]--;
        console.log(`${players[entities[i].lobby]} remaining in room ${entities[i].lobby}`);
        entities.splice(i, 1);
        break;
      }
    }
  });
});