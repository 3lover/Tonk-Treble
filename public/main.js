/*global io*/
"use strict"

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
  //util.toggleElements(['gamemenu'], ['mainmenu', 'centerContain']);
}

document.getElementById("leavelobbybtn").onclick = () => {
  socket.emit("message", "user clicked join button");
  socket.emit("userLeft", document.getElementById("server").value);
}