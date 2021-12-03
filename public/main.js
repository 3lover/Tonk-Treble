/*global io*/
const socket = io();

socket.on('message', message => {
  document.getElementById("testing").innerHTML = message
});