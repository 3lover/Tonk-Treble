// setup server and ports
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

// get our personal requires
const util = require('./public/util.js');
const c = require('./config.json');

// initialize player counts on each server
let players = [0, 0, 0, 0];

// initialize stuff
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
    this.x = Math.floor(Math.random() * c.BASESIZE);
    this.y = Math.floor(Math.random() * c.BASESIZE);
    this.width = 4000;
    this.height = 5000;
    this.rotation = 0;
    this.speed = 100;
    this.turnspeed = 0.1;
    this.color = "#" + Math.floor(Math.random()*16777215).toString(16);
    this.vectors = [0, 0, 0, 0, 0];
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
  
  // when a client presses a button in game recieve it here and see if we need to do stuff
  socket.on("keydown", key => {
    for (let i in entities) {
      let e = entities[i];
      if (e.client !== socket.id) continue;
      if (key == 38) e.vectors[0] = 1;
      if (key == 40) e.vectors[2] = 1;
      if (key == 37) e.vectors[1] = 1;
      if (key == 39) e.vectors[3] = 1;
    }
  });
  // same but release stuff
  socket.on("keyup", key => {
    for (let i in entities) {
      let e = entities[i];
      if (e.client !== socket.id) continue;
      if (key == 38) e.vectors[0] = 0;
      if (key == 40) e.vectors[2] = 0;
      if (key == 37) e.vectors[1] = 0;
      if (key == 39) e.vectors[3] = 0;
    }
  });
  
  // when a client leaves a room remove their player
  socket.on("userLeft", room => {
    socket.leave(room);
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
        socket.leave(entities[i].lobby);
        util.log(`${players[entities[i].lobby]} remaining in room ${entities[i].lobby}`);
        entities.splice(i, 1);
        break;
      }
    }
  });
});

function mainLoop() {
  // runs 40 times a second and runs the servers
  for (let l = 0; l < players.length; l++) {
    
    // get the entities in the specific lobby
    let objects = entities.filter( entity => {
      return entity.lobby == l;
    });
    for (let i in objects) {
      let e = objects[i];
      e.x += e.vectors[0] ? Math.sin(e.rotation) * 100 : e.vectors[2] ? -Math.sin(e.rotation) * 100 : 0;
      e.y += e.vectors[0] ? -Math.cos(e.rotation) * 100 : e.vectors[2] ? Math.cos(e.rotation) * 100 : 0;
      e.rotation += e.vectors[1] ? -e.turnspeed : e.vectors[3] ? e.turnspeed : 0;
    }
    
    // send the render data to the clients
    let renderdata = [];
    for (let j = 0; j < objects.length; j++) {
      let client = objects[j];
      renderdata.push({
        type: 0,
        subclass: 0,
        x: client.x,
        y: client.y,
        width: client.width,
        height: client.height,
        color: client.color,
        rotation: client.rotation
      });
    }
    io.to(l.toString()).emit("render", renderdata);
  }
}

setInterval(mainLoop, 25);