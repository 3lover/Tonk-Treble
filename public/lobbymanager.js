/* global io */
//initialize the socket
let socket = io();

function joinlobby(room) {
  document.getElementById("testing").innerHTML = "g";
  //socket.emit("userJoined", room)
}