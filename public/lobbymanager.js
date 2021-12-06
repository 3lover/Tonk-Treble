/* global io */
//initialize the socket
let socket = io();

function joinlobby(room) {
  document.getElementById("testing").innerHTML = "Script Running";
  socket.emit("userJoined", room);
}