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
  constructor(client = null, lobby = 0, type = -1, prop = {}) {
    // server values
    this.client = client;
    this.lobby = lobby;
    this.type = type;
    this.subclass = prop.subclass || 0;
    this.host = prop.host || false;
    this.camx = prop.camx || prop.x || 0;
    this.camy = prop.camy || prop.y || 0;
    // game values
    this.width = prop.width || 1000;
    this.height = prop.height || 1000;
    this.shape = prop.shape || 4;
    this.rotation = prop.rotation || 0;
    this.speed = prop.speed || 100;
    this.turnspeed = prop.turnspeed || 0.1;
    this.color = prop.color || "#" + Math.floor(Math.random()*16777215).toString(16);
    this.vectors = prop.vectors || [0, 0, 0, 0, 0];
    this.x = prop.x || 0;
    this.y = prop.y || 0;
    this.vision = prop.vision || 10000;
    this.hitbox = prop.hitbox || {shape: this.shape, x: this.x, y: this.y, w: this.width, h: this.height, a: this.rotation};
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
    socket.join(socket.id);
    players[room]++;
    let e = new Entity(socket.id, room, 0, {
      subclass: 0,
      vision: 30000,
      host: players[room] == 1
    });
    checkLocation(e);
    e.hitbox = {shape: 4, x: e.x, y: e.y, w: e.width, h: e.height, a: e.rotation};
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
    if (players[room] < 1) {
      console.log("Shutting down due to inactivity");
      process.exit();
    }
  });
  
  // when a client disconnects check if they are in a room and if so remove their object
  socket.on('disconnect', () => {
    for (let i in entities) {
      if (entities[i].client === socket.id) {
        players[entities[i].lobby]--;
        socket.leave(entities[i].lobby);
        util.log(`${players[entities[i].lobby]} remaining in room ${entities[i].lobby}`);
        if (players[entities[i].lobby] + 1 < 1) {
          console.log("Shutting down due to inactivity");
          process.exit();
        }
        entities.splice(i, 1);
        break;
      }
    }
  });
});

// return true if an object is out of the map size
function outOfBounds(obj = {shape: 4, x: 0, y: 0, w: 0, h: 0, a: 0}) {
  // do some basic wall collisions
    if (obj.x + obj.w/2 > c.BASESIZE || obj.y + obj.h/2 > c.BASESIZE ||
        obj.x - obj.w/2 < 0 || obj.y - obj.h/2 < 0) return true;
    return false;
}

// return true if two objects within the parameters overlap
function collideCheck(obj1 = {shape: 4, x: 0, y: 0, w: 0, h: 0, a: 0}, obj2 = {shape: 0, x: 0, y: 0, r: 0}) {
  // square~square collide
  if (obj1.shape == 4 && obj2.shape == 4) {
    //check if obj1 collides along x and y axis. If both don't collide that means there are no collisions
    if ((obj1.x - obj1.w/2 > obj2.x + obj2.w/2 || obj1.x + obj1.w/2 > obj2.x - obj2.w/2) && 
        (obj1.x - obj1.w/2 < obj2.x + obj2.w/2 || obj1.x + obj1.w/2 < obj2.x - obj2.w/2) &&
        (obj1.y - obj1.h/2 > obj2.y + obj2.h/2 || obj1.y + obj1.h/2 > obj2.y - obj2.h/2) && 
        (obj1.y - obj1.h/2 < obj2.y + obj2.h/2 || obj1.y + obj1.h/2 < obj2.y - obj2.h/2)) return true;
    return false;
  }
  // square~circle collide
  if ((obj1.shape == 4 && obj2.shape == 0) || (obj1.shape == 0 && obj2.shape == 4)) {
    let rect = obj1.shape == 4 ? obj1 : obj2,
        circle = obj1.shape == 4 ? obj2 : obj1;
    // circle physics are fun 
    //   ~no one ever
    let circx = Math.abs(circle.x - rect.x);
    let circy = Math.abs(circle.y - rect.y);

    if (circx > rect.w/2 + circle.r) return false;
    if (circy > rect.h/2 + circle.r) return false;

    if (circx <= rect.w/2 || circy <= rect.h/2) return true;

    let dx = (circx - rect.w/2);
		let dy = (circy - rect.h/2);
		if (dx ** 2 + dy ** 2 <= circle.r ** 2) return true;
    return false;
  }
  // circle~circle collide
  if (obj1.shape == 0 && obj2.shape == 0);
}

// choose a random location for an object with in set limits
function checkLocation(e, avoid = [0, 1, 2, 3]) {
  for (let i = 0; i < 100000; i++) {
    e.x = Math.floor(Math.random() * c.BASESIZE);
    e.y = Math.floor(Math.random() * c.BASESIZE);
    e.hitbox.x = e.x;
    e.hitbox.y = e.y;
    //console.log(JSON.stringify(e.hitbox))
    if (outOfBounds(e.hitbox)) continue;
    //else console.log(JSON.stringify(e.hitbox));
    let goodspot = true;
    for (let i = 0; i < entities.length; i++) {
      let other = entities[i];
      if (!avoid.includes(other.type) || other == e || other.lobby != e.lobby) continue;
      if (collideCheck(e.hitbox, other.hitbox)) {
        goodspot = false;
        break;
      }
    }
    if (goodspot) break;
  }
  console.log(JSON.stringify(e.hitbox));
  console.log(outOfBounds(e.hitbox));
}

// runs 40 times a second, handles movement, sending render data, and runs collision functions
function mainLoop() {
  for (let l = 0; l < 1; l++) { //players.length
    
    // get the entities in the specific lobby
    let objects = entities.filter( entity => {
      return entity.lobby == l;
    });
    for (let i in objects) {
      let e = objects[i];
      // for wall collidions easier to save values than undo movement
      let saved = [e.x, e.y];
      e.x += e.vectors[0] ? Math.sin(e.rotation) * e.speed : e.vectors[2] ? -Math.sin(e.rotation) * e.speed : 0;
      e.y += e.vectors[0] ? -Math.cos(e.rotation) * e.speed : e.vectors[2] ? Math.cos(e.rotation) * e.speed : 0;
      e.rotation += e.vectors[1] ? -e.turnspeed : e.vectors[3] ? e.turnspeed : 0;
      
      // remake hitbox
      e.hitbox.x = e.x;
      e.hitbox.y = e.y;
      e.hitbox.a = e.rotation;
      
      // go through each entity and check if we should look further
      for (let j = 0; j < objects.length; j++) {
        let other = objects[j];
        if (outOfBounds(e.hitbox)) {
          e.x = saved[0];
          e.y = saved[1];
        }
        if (collideCheck(e.hitbox, other.hitbox)) {
          switch (e.type) {
            case 0:
              // tank on tank collide
              if (other.type == 0) {}
              // tank on bullet collide
              if (other.type == 1) {}
              // tank on wall collide
              if (other.type == 2) {
                e.x = saved[0];
                e.y = saved[1];
              }
              // tank on powerup collide
              if (other.type == 3) {}
              break;
            case 1:
              // bullet on bullet collide
              if (other.type == 1) {}
              // bullet on wall collide
              if (other.type == 2) {}
              // bullet and powerup collide, just in case
              if (other.type == 3) {}
              break;
          }
        }
      }
    }
    
    // go through each client, and send the appropriate data
    for (let c = 0; c < objects.length; c++) {
      let client = objects[c];
      if (!client.client) continue;
      let renderdata = [];
      for (let j = 0; j < objects.length; j++) {
        let obj = objects[j];
        if (obj.x < client.x - client.vision || obj.x > client.x + client.vision || obj.y < client.y - client.vision || obj.y > client.y + client.vision) continue;
        renderdata.push({
          type: obj.type,
          subclass: obj.subclass,
          x: (client.x - obj.x) + 5000,
          y: (client.y - obj.y) + 5000,
          width: obj.width,
          height: obj.height,
          color: obj.color,
          rotation: obj.rotation + Math.PI
        });
      }
      io.to(client.client).emit("render", renderdata);
    }
  }
}

setInterval(mainLoop, 25);
for (let r = 0; r < 1; r++) {
    let e = new Entity(null, 0, 2, {
      shape: 0,
      width: 500,
      color: "black",
      subclass: 0
    });
    e.hitbox = {shape: 0, x: e.x, y: e.y, r: e.width};
    checkLocation(e);
    entities.push(e);
    e = new Entity(null, 0, 2, {
      shape: 4,
      width: 18000,
      height: 18000,
      color: "black",
      subclass: 4
    });
  //console.log ("big block tries:")
    e.hitbox = {shape: 4, x: e.x, y: e.y, w: e.width, h: e.height, a: e.rotation};
    checkLocation(e);
    entities.push(e);
}

//console.log("test: " + outOfBounds({shape: 4, x: 8999, y: 10000, w: 18000, h: 18000, a: 0}));