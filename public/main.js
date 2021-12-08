/*global io*/
// initalize the socket
const socket = io();

// check for messages over the socket and print them
socket.on('message', message => {
  // do stuff with it
});