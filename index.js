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
    let e = new Entity(socket.id, "t");
    entities.push(e);
    console.log("player joined from " + room + ". Now there are " + players[room] + " players; " + entities.length + " " + socket.id)
  });
  
  // when a client leaves a room let us know and update
  socket.on("userLeft", room => {
    //players[entities[entities.indexOf(socket.id)].lobby]--;
    //entities.splice(entities.indexOf(socket.id), 1);
    //console.log("a player has left room " + room + ". " + players[room] + " players remain;")
  });
  
  // when a client disconnects check if they are in a room
  socket.on('disconnect', () => {
    console.log("A User Has Left, " + entities.length + " " + socket.id);
    // check if we have a player instance and if so remove it
    console.log("--");
    for (let i in entities) {
      console.log(entities[i].client);
      if (entities[i].client === socket.id) {
        console.log(socket.id + " removed")
        players[entities[i].lobby]--;
        entities.splice(i, 1);
        break;
      }
    }
  });
});