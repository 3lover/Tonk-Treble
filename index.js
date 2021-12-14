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
  constructor(client = null, lobby = 0, type = -1) {
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
    this.shape = 4;
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
    let e = new Entity(socket.id, room, 0);
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

// return true if two objects within the parameters overlap
function collideCheck(obj1 = {shape: 4, x: 0, y: 0, w: 0, h: 0, a: 0}, obj2 = {shape: 0, x: 0, y: 0, r: 0}) {
  // square~square collide
  if (obj1.shape == 4 && obj2.shape == 4) {
    //check if obj1 collides along x and y axis. If both don't collide that means there are no collisions
    if ((obj1.x - obj1.w/2 > obj2.x + obj2.w/2 || obj1.x + obj1.w/2 > obj2.x - obj2.w/2) &&
       ((obj1.y - obj1.h/2 > obj2.y + obj2.h/2 || obj1.y + obj1.h/2 > obj2.y - obj2.h/2))) return true;
    return false;
  }
  // square~circle collide
  if ((obj1.shape == 4 && obj2.shape == 0) || (obj1.shape == 0 && obj2.shape == 4)) {
    let rect = obj1.shape == 4 ? obj1 : obj2,
        circle = obj1.shape == 4 ? obj2 : obj1;
    // from stack overflow, probably works?
    circle.x = Math.abs(circle.x - rect.x);
    circle.y = Math.abs(circle.y - rect.y);

    if (circle.x > (rect.w/2 + circle.r)) { return false; }
    if (circle.y > (rect.h/2 + circle.r)) { return false; }

    if (circle.x <= (rect.w/2)) { return true; } 
    if (circle.y <= (rect.h/2)) { return true; }

    let cornerDistance = Math.sqrt( (circle.x - rect.width/2)**2 + (circle.y - rect.height/2)**2 );

    return (cornerDistance <= (circle.r^2));
  }
  // circle~circle collide
  if (obj1.shape == 0 && obj2.shape == 0);
}

// runs 40 times a second, handles movement, sending render data, and runs collision functions
function mainLoop() {
  for (let l = 0; l < players.length; l++) {
    
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
      
      // go through each entity pair one time and check for collisions
      for (let j = i; j < objects.length; j++) {
        let other = objects[j];
        //console.log()
        if (collideCheck({shape: e.shape, x: e.x, y: e.y, w: e.width, h: e.height, a: e.rotation}, {shape: other.shape, x: other.x, y: other.y, w: other.width, h: other.height, a: other.rotation})) {
          // tanks(0), bullets(1), walls(2), powerups(3) valued in that order
          let runner = e.type < other.type ? e : other,
              follow = e.type < other.type ? other : e;
          switch (runner.type) {
            case 0:
              // tank on tank collide
              if (follow.type == 0) {
                //runner.x = saved[0];
                //runner.y = saved[1];
              }
              // tank on bullet collide
              if (follow.type == 1) {}
              // tank on wall collide
              if (follow.type == 2) {
                runner.x -= runner.vectors[0] ? Math.sin(runner.rotation) * runner.speed : runner.vectors[2] ? -Math.sin(runner.rotation) * runner.speed : 0;
                runner.y -= runner.vectors[0] ? -Math.cos(runner.rotation) * runner.speed : runner.vectors[2] ? Math.cos(runner.rotation) * runner.speed : 0;
              }
              // tank on powerup collide
              if (follow.type == 3) {}
              break;
            case 1:
              // bullet on bullet collide
              if (follow.type == 1) {}
              // bullet on wall collide
              if (follow.type == 2) {}
              // bullet and powerup collide, just in case
              if (follow.type == 3) {}
              break;
          }
        }
      }
    }
    
    // send the render data to the clients
    let renderdata = [];
    for (let j = 0; j < objects.length; j++) {
      let client = objects[j];
      renderdata.push({
        type: client.type,
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

    let e = new Entity(null, 1, 2);
    e.x = 1000;
    e.y = 1000;
    e.width = 1000;
    e.height = 1000;
    e.color = "black";
    entities.push(e);