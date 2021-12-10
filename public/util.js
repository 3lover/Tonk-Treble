/* global io */
var socket = io();

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
  socket.emit("userJoined", room);
}

// emit when a player leaves
function leavelobby(room) {
  //let the server know a user joined
  socket.emit("userLeft", room);
}

document.getElementById("leavelobby").onclick = function() {
  alert("button clicked");
  //toggleElements(['centerContain', 'mainmenu'], ['gamemenu']);leavelobby(document.getElementById('server').value)
}