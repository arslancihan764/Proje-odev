const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

// --- SORULAR ---
const questions = [
  { q: "Emziren kadınlarda önerilmeyen yöntem?", options: ["KOK", "RİA", "Kondom", "POP"], answer: 0 },
  { q: "Doğum sonrası hormonal yöntem ne zaman başlanabilir?", options: ["Hemen", "6 hafta sonra", "1 yıl sonra", "Asla"], answer: 1 },
  { q: "Gençlerde CYBE için en önemli korunma yöntemi?", options: ["RİA", "Kondom", "Ligasyon", "İmplant"], answer: 1 },
  { q: "Nullipar nedir?", options: ["Doğum yapmamış", "İkiz doğurmuş", "Menopozda", "Erkek partner"], answer: 0 },
  { q: "Acil kontrasepsiyon en etkilisi?", options: ["KOK", "Bakırlı RİA", "Doğal", "Takvim yöntemi"], answer: 1 },
  { q: "Menopoz ortalama kaç yaş?", options: ["35", "42", "50", "58"], answer: 2 },
  { q: "AP Projesi başarıyla tamamlandı mı?", options: ["Hayır", "Belki", "EVET!", "Sanmıyorum"], answer: 2 }
];

let players = {}; 
let gameStatus = "waiting"; 
let winner = null;

io.on("connection", (socket) => {
  
  // GİRİŞ
  socket.on("joinGame", (name) => {
    players[socket.id] = {
      id: socket.id,
      name: name,
      role: "player",
      currentQuestionIndex: 0,
      eliminated: false,
      finished: false
    };
    broadcastUpdate();
  });

  socket.on("joinAsAdmin", () => {
    players[socket.id] = { id: socket.id, name: "Yönetici", role: "admin" };
    socket.emit("adminData", { players, gameStatus, totalQuestions: questions.length });
  });

  // BAŞLAT
  socket.on("startGame", () => {
    gameStatus = "playing";
    winner = null;
    // Herkesin durumunu sıfırla (yeniden başlatma desteği için)
    Object.values(players).forEach(p => {
      if(p.role === "player") {
        p.currentQuestionIndex = 0;
        p.eliminated = false;
        p.finished = false;
      }
    });
    io.emit("gameStarted");
    broadcastUpdate();
  });

  // CEVAP KONTROLÜ
  socket.on("submitAnswer", (answerIndex) => {
    const player = players[socket.id];
    if (!player || player.role === "admin" || player.eliminated || gameStatus !== "playing") return;

    const currentQ = questions[player.currentQuestionIndex];

    if (answerIndex === currentQ.answer) {
      // DOĞRU
      player.currentQuestionIndex++;
      
      if (player.currentQuestionIndex >= questions.length) {
        player.finished = true;
        if (!winner) {
          winner = player.name;
          gameStatus = "finished";
          io.emit("gameOver", { winnerName: player.name });
        } else {
          socket.emit("playerFinishedLate"); 
        }
      } else {
        socket.emit("nextQuestion", player.currentQuestionIndex);
      }

    } else {
      // YANLIŞ -> ELENDİ
      player.eliminated = true;
      socket.emit("youAreEliminated");
    }
    
    // HER HAMLEDEN SONRA KONTROL ET: KİMSE KALDI MI?
    checkIfAllEliminated();
    broadcastUpdate();
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    // Eğer oyun sırasında herkes çıkarsa oyunu bitir
    if (gameStatus === "playing") checkIfAllEliminated();
    broadcastUpdate();
  });
});

function checkIfAllEliminated() {
  if (gameStatus !== "playing") return;

  const playerList = Object.values(players).filter(p => p.role === "player");
  if (playerList.length === 0) return; // Kimse yoksa işlem yapma

  // Hala yarışan (elenmemiş ve bitirmemiş) kişi sayısı
  const activePlayers = playerList.filter(p => !p.eliminated && !p.finished).length;

  // Eğer kazanan yoksa VE aktif oyuncu kalmadıysa -> HERKES KAYBETTİ
  if (!winner && activePlayers === 0) {
    gameStatus = "finished";
    io.emit("gameOver", { noWinner: true });
  }
}

function broadcastUpdate() {
  const playerList = Object.values(players).filter(p => p.role === "player");
  const adminSocket = Object.values(players).find(p => p.role === "admin");
  
  if (adminSocket) {
    io.to(adminSocket.id).emit("adminData", { 
      players: playerList, 
      gameStatus,
      totalQuestions: questions.length
    });
  }
  io.emit("playerCountUpdate", playerList.length);
}

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
