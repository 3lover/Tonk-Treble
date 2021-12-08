/* global io */

// shows and hides html elements
function toggleElements(show = [], hide = []) {
  for (let i in show) {
    document.getElementById(show[i]).style.display = "block";
  }
  for (let i in hide) {
    document.getElementById(hide[i]).style.display = "none";
  }
}

// send join request
function joinlobby(room) {
  //let the server know a user joined
  let socket = io();
  socket.emit("userJoined", room);
}