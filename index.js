// setup server and ports
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

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
  
  // when a client joins a room let us know
  socket.on("userJoined", room => {
    // create a room object for the joined client and take note
    players[room]++;
    let e = new Entity(socket.id, room, "t");
    entities.push(e);
    console.log("Room join. ID: " + socket.id + " - Entities now: " + entities.length + " - Room: " + room);
  });
  
  // when a client leaves a room let us know and update
  socket.on("userLeft", room => {
    for (let i in entities) {
      if (entities[i].client === socket.id) {
        players[entities[i].lobby]--;
        entities.splice(i, 1);
        break;
      }
    }
    console.log("Room left. ID: " + socket.id + " - Entities Left: " + entities.length + " - Room: " + room);
  });
  
  // when a client disconnects check if they are in a room
  socket.on('disconnect', () => {
    console.log("User left. ID: " + socket.id + " - Entities Left: " + entities.length)
    // check if we have a player instance and if so remove it
    for (let i in entities) {
      if (entities[i].client === socket.id) {
        players[entities[i].lobby]--;
        entities.splice(i, 1);
        break;
      }
    }
  });
});