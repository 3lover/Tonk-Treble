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
  //socket.emit("message", keycode);
  if (keycode == 13 && windowType == 0) document.getElementById("joinlobbybtn").click();
  else socket.emit("keydown", keycode)
};
document.onkeyup = (e) => {
  let keycode = e.keyCode || e.which;
  socket.emit("message", keycode);
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
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  //move to the right x to make the screen render as a square
  ctx.translate((WIDTH - HEIGHT)/2, 0);
  // the ratio is 10000 = the canvas height for drawing. 0 is center and goes through -5000 to 5000
  for (let i in data) {
    let shape = data[i];
    let ratio = canvas.height / 10000;
    if (shape.type == 0) {
      // rotate the canvas and move so as 0,0 is the orgin point of the shape being drawn
      ctx.translate(shape.x * ratio, shape.y * ratio);
      ctx.rotate(shape.rotation);
      ctx.lineWidth = 30;
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
    if (shape.type == 2) {
      // move canvas in case we need to rotate
      ctx.translate(shape.x * ratio, shape.y * ratio);
      ctx.rotate(shape.rotation);
      ctx.lineWidth = 30;
      ctx.fillStyle = shape.color;
      
      //draw it
      ctx.beginPath();
      ctx.arc(shape.width/2);
      //ctx.rect(-shape.width/2 * ratio, -shape.height/2 * ratio, shape.width * ratio, shape.height * ratio);
      ctx.fill();
      ctx.stroke();
      
      // reset canvas
      ctx.rotate(-shape.rotation);
      ctx.translate(-shape.x * ratio, -shape.y * ratio);
    }
  }
  // move the screen back
  ctx.translate(-(WIDTH - HEIGHT)/2, 0);
})