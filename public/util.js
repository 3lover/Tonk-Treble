/* global io */
$(function() {
  window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
    }
  });
/*//var socket = io();

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
  //alert("button clicked");
  //toggleElements(['centerContain', 'mainmenu'], ['gamemenu']);leavelobby(document.getElementById('server').value)
}*/
});