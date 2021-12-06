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
  let c = new Client(room);
  if (checkLobbyUsers() === 1) c.host = true;
  Clients.push(c);
  socket.emit("userJoined", {room: room, })
}

function checkLobbyUsers(room) {
  let users = 0;
  for (let i in Clients) {
    let c = Clients[i];
    if (c.room === room) users++;
  }
  return users;
}