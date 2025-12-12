const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let gameStarted = false;
let winner = null;

io.on("connection", (socket) => {
  // Oyuncu bağlandığında
  socket.on("joinGame", (name) => {
    players[socket.id] = { name: name, eliminated: false };
    io.emit("updatePlayerCount", Object.keys(players).length);
  });

  // Hoca (Host) oyunu başlattığında
  socket.on("hostStartGame", () => {
    gameStarted = true;
    winner = null;
    io.emit("gameStarted");
  });

  // Biri elendiğinde
  socket.on("playerEliminated", () => {
    if(players[socket.id]) {
      players[socket.id].eliminated = true;
    }
  });

  // Biri oyunu bitirdiğinde (KAZANAN)
  socket.on("playerFinished", () => {
    if (!winner && players[socket.id]) {
      winner = players[socket.id].name;
      io.emit("gameOver", winner);
    }
  });

  // Oyuncu çıktığında
  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayerCount", Object.keys(players).length);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Sunucu çalışıyor...");
});

