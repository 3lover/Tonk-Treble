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
  // the ratio is 10000 = the canvas height for drawing. 0 is center and goes through -5000 to 5000
  for (let i in data) {
    let shape = data[i];
    let ratio = canvas.height / 10000;
    if (shape.sides == 4) {
      ctx.beginPath();
      ctx.lineWidth = 30;
      ctx.fillStyle = shape.color;
      ctx.rect(shape.x * ratio, shape.y * ratio, shape.width * ratio, shape.height * ratio);
      ctx.fill();
      ctx.stroke();
    }
  }
})