/* global io */

function dostuff() {
//use the socket to send a message
let socket = io();
}

function joinlobby(room) {
  //let the server know a user joined
  let socket = io();
  socket.emit("userJoined", room);
}