/*global io*/
"use strict"

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