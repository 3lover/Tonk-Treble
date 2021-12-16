/*global io*/
"use strict"

// get our canvas
const canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"),
      WIDTH = window.innerWidth * 5,
      HEIGHT = window.innerHeight * 4;

canvas.width = WIDTH;
canvas.height = HEIGHT;

//set up the client information
let windowType = 0,
    datastore = [],
    speedstats = {ping: 0, serverspeed: 100, lastpingtime: 0, shownping: 0}

// setting up some helper functions

// shows and hides html elements
function toggleElements(show = [], hide = []) {
  for (let i in show) {
    document.getElementById(show[i]).style.display = "block";
  }
  for (let i in hide) {
    document.getElementById(hide[i]).style.display = "none";
  }
}

//initialize the client connection
const socket = io();

// when a client presses a button send it to the server
document.onkeydown = (e) => {
  let keycode = e.keyCode || e.which;
  if (keycode == 13 && windowType == 0) document.getElementById("joinlobbybtn").click();
  else socket.emit("keydown", keycode)
};
document.onkeyup = (e) => {
  let keycode = e.keyCode || e.which;
  socket.emit("keyup", keycode)
};

document.getElementById("joinlobbybtn").onclick = () => {
  socket.emit("message", "user clicked join button");
  socket.emit("userJoined", document.getElementById("server").value);
  toggleElements(['gamemenu'], ['mainmenu', 'centerContain']);
  windowType = 1;
}

document.getElementById("leavelobbybtn").onclick = () => {
  socket.emit("message", "user clicked leave button");
  socket.emit("userLeft", document.getElementById("server").value);
  toggleElements(['mainmenu', 'centerContain'], ['gamemenu']);
  windowType = 0;
}

socket.on("render", (data) => {
  if (windowType == 0) return;
  datastore = data;
  let newdate = new Date().getTime();
  if (speedstats.lastpingtime == 0) speedstats.lastpingtime = new Date().getTime();
  speedstats.ping = speedstats.ping < newdate - speedstats.lastpingtime ? newdate - speedstats.lastpingtime : speedstats.ping;
  speedstats.lastpingtime = newdate;
});

// when the speed check loop fires get an update
socket.on("speedcheck", (speed) => {
  speedstats.serverspeed = speed;
});


// render what we think the current game state is based on data
// this is done seperately to avoid some desync and lag issues
function renderLoop() {
  // if we don't even have a canvas don't render
  if (windowType == 0) return;
  let ratio = canvas.height / 10000;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  //move to the right x to make the screen render as a square
  ctx.translate((WIDTH - HEIGHT)/2, 0);
  // the ratio is 10000 = the canvas height for drawing. 0 is center and goes through -5000 to 5000
  for (let i in datastore) {
    let shape = datastore[i];
    
    // ignore specialty data such as vision bubbles
    if (shape.type == 100) continue;
    
    // tank
    if (shape.type == 0) {
      // rotate the canvas and move so as 0,0 is the orgin point of the shape being drawn
      ctx.translate(shape.x * ratio, shape.y * ratio);
      ctx.rotate(shape.rotation);
      ctx.lineWidth = 20;
      ctx.fillStyle = shape.color;
      
      // draw the guns in accordance the the tank subclass
      ctx.beginPath();
      switch (shape.subclass) {
        case 0:
          ctx.rect(-shape.width/4 * ratio, -shape.height/2 * ratio, shape.width/2 * ratio, shape.height * -0.2 * ratio);
          break;
      }
      ctx.stroke();
      ctx.fill();
      
      // draw the tank body
      ctx.beginPath();
      ctx.rect(-shape.width/2 * ratio, -shape.height/2 * ratio, shape.width * ratio, shape.height * ratio);
      ctx.fill();
      ctx.stroke();
      
      // reset canvas
      ctx.rotate(-shape.rotation);
      ctx.translate(-shape.x * ratio, -shape.y * ratio);
    }
    // walls
    if (shape.type == 2) {
      // move canvas in case we need to rotate
      ctx.translate(shape.x * ratio, shape.y * ratio);
      ctx.rotate(shape.rotation);
      ctx.lineWidth = 30;
      ctx.fillStyle = shape.color;
      
      //draw it
      ctx.beginPath();
      if (shape.subclass == 0) ctx.arc(0, 0, shape.width * ratio, 0, 7);
      else if (shape.subclass == 4) ctx.rect(-shape.width/2 * ratio, -shape.height/2 * ratio, shape.width * ratio, shape.height * ratio);
      ctx.fill();
      ctx.stroke();
      
      // reset canvas
      ctx.rotate(-shape.rotation);
      ctx.translate(-shape.x * ratio, -shape.y * ratio);
    }
  }
  // move the screen back
  ctx.translate(-(WIDTH - HEIGHT)/2, 0);
  
  // draw the screen borders in proportion to height to make a square display
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.strokeStyle = "grey";
  ctx.lineWidth = 40;
  ctx.rect(0, 0, (WIDTH - HEIGHT)/2, HEIGHT);
  ctx.rect(WIDTH, 0, -(WIDTH - HEIGHT)/2, HEIGHT);
  ctx.fill();
  ctx.stroke();
  // hide everything not inside the vision bubble
  let shape = datastore[datastore.length - 1];
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.arc((WIDTH - HEIGHT)/2 + shape.x * ratio, shape.y * ratio, 4500 * ratio, 0, 2 * Math.PI);
  ctx.rect(WIDTH, 0, -WIDTH, HEIGHT);
  ctx.fill();
  
  // draw our ping and server speed, but only update every second so not too distracting
  let pingtext = "Ping: " + speedstats.shownping,
      serverspeedtext = "Server Speed: " + speedstats.serverspeed + "%";
  ctx.font = ((WIDTH - HEIGHT) / 2 / 11) + 'px serif';
  ctx.fillStyle = speedstats.shownping > 300 ? "red" : "white";
  ctx.fillText(pingtext, 0, HEIGHT * 0.2, (WIDTH - HEIGHT)/2);
  ctx.fillStyle = speedstats.serverspeed < 90 ? "red" : "white";
  ctx.fillText(serverspeedtext, 0, HEIGHT * 0.3, (WIDTH - HEIGHT)/2);
}

// update ping speed display once per second
function updateping() {
  speedstats.shownping = speedstats.ping;
  speedstats.ping = 0;
}

setInterval(renderLoop, 25);
setInterval(updateping, 1000);