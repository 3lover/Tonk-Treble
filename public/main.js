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
let windowType = 0;

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
  else socket.volatile.emit("keydown", keycode)
};
document.onkeyup = (e) => {
  let keycode = e.keyCode || e.which;
  socket.volatile.emit("keyup", keycode)
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
  let ratio = canvas.height / 10000;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  ctx.strokeStyle = "black";
  //move to the right x to make the screen render as a square
  ctx.translate((WIDTH - HEIGHT)/2, 0);
  // the ratio is 10000 = the canvas height for drawing. 0 is center and goes through -5000 to 5000
  for (let i in data) {
    let shape = data[i];
    
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
  ctx.rect(HEIGHT + (WIDTH - HEIGHT)/2, 0, WIDTH, HEIGHT);
  ctx.fill();
  ctx.stroke();
  // hide everything not inside the vision bubble
  ctx.translate((WIDTH - HEIGHT)/2, 0);
  let shape = data[data.length - 1];
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.arc(shape.x * ratio, shape.y * ratio, 4000 * ratio, 0, 2 * Math.PI);
  ctx.rect(WIDTH, 0, -WIDTH, HEIGHT);
  ctx.fill();
  ctx.translate(-(WIDTH - HEIGHT)/2, 0);
})