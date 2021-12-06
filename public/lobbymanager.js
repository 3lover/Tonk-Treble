/* global io */
const socket = io();

let Clients = [];
class Client {
  constructor(room) {
    this.room = room;
    this.host = false;
  }
}

function joinlobby(room) {
  document.getElementById("main-menu").innerHTML = "g"
  //socket.emit("userJoined", room)
}

function checkLobbyUsers(room) {
  let users = 0;
  for (let i in Clients) {
    let c = Clients[i];
    if (c.room === room) users++;
  }
  return users;
}