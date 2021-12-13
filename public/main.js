/*global io*/
"use strict"

// get our canvas
const canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"),
      WIDTH = window.innerWidth * 5,
      HEIGHT = window.innerHeight * 4;

canvas.width = WIDTH;
canvas.height = HEIGHT;

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

//for testing purposes, when a key is pressed send it to the server
document.onkeydown = (e) => {
  let keycode = e.keyCode || e.which;
  socket.emit("message", keycode);
};

document.getElementById("joinlobbybtn").onclick = () => {
  socket.emit("message", "user clicked join button");
  socket.emit("userJoined", document.getElementById("server").value);
  toggleElements(['gamemenu'], ['mainmenu', 'centerContain']);
}

document.getElementById("leavelobbybtn").onclick = () => {
  socket.emit("message", "user clicked leave button");
  socket.emit("userLeft", document.getElementById("server").value);
  toggleElements(['mainmenu', 'centerContain'], ['gamemenu']);
}

socket.on("render", (data) => {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.beginPath();
  // the x axis length is 1000, the y is 800, values scaled and put along them
  for (let i in data) {
    let shape = data[i];
    if (shape.sides == 4) {
      ctx.rect(shape.x, sh--ape.y, shape.width, shape.height);
      ctx.fill();
    }
  }
})