const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// --- OYUN AYARLARI VE SORULAR ---
const questions = [
  { q: "Emziren kadınlarda önerilmeyen yöntem?", options: ["KOK", "RİA", "Kondom", "POP"], answer: 0 },
  { q: "Doğum sonrası hormonal yöntem ne zaman başlanabilir?", options: ["Hemen", "6 hafta sonra", "1 yıl sonra", "Asla"], answer: 1 },
  { q: "Gençlerde CYBE için en önemli korunma yöntemi?", options: ["RİA", "Kondom", "Ligasyon", "İmplant"], answer: 1 },
  { q: "Nullipar nedir?", options: ["Doğum yapmamış", "İkiz doğurmuş", "Menopozda", "Erkek partner"], answer: 0 },
  { q: "Acil kontrasepsiyon en etkilisi?", options: ["KOK", "Bakırlı RİA", "Doğal", "Takvim yöntemi"], answer: 1 },
  { q: "Menopoz ortalama kaç yaş?", options: ["35", "42", "50", "58"], answer: 2 },
  { q: "AP Projesi başarıyla tamamlandı mı?", options: ["Hayır", "Belki", "EVET!", "Sanmıyorum"], answer: 2 }
];

// Oyuncu Verileri
let players = {}; 
let gameStatus = "waiting"; // waiting, playing, finished
let winner = null;

io.on("connection", (socket) => {
  
  // 1. ÖĞRENCİ GİRİŞİ
  socket.on("joinGame", (name) => {
    players[socket.id] = {
      id: socket.id,
      name: name,
      role: "player",
      currentQuestionIndex: 0,
      eliminated: false,
      finished: false
    };
    // Herkese güncel sayıyı, öğretmene detaylı listeyi gönder
    broadcastUpdate();
  });

  // 2. ÖĞRETMEN GİRİŞİ (Yönetici)
  socket.on("joinAsAdmin", () => {
    players[socket.id] = {
      id: socket.id,
      name: "Öğretmen",
      role: "admin"
    };
    socket.emit("adminData", { players, gameStatus });
  });

  // 3. OYUNU BAŞLAT (Sadece Öğretmen)
  socket.on("startGame", () => {
    gameStatus = "playing";
    winner = null;
    io.emit("gameStarted");
    broadcastUpdate();
  });

  // 4. CEVAP KONTROLÜ
  socket.on("submitAnswer", (answerIndex) => {
    const player = players[socket.id];
    if (!player || player.role === "admin" || player.eliminated) return;

    const currentQ = questions[player.currentQuestionIndex];

    if (answerIndex === currentQ.answer) {
      // DOĞRU CEVAP
      player.currentQuestionIndex++;
      
      // Oyun bitti mi bu kişi için?
      if (player.currentQuestionIndex >= questions.length) {
        player.finished = true;
        // Eğer ilk bitirense KAZANAN odur
        if (!winner) {
          winner = player.name;
          gameStatus = "finished";
          io.emit("gameOver", { winnerName: player.name });
        } else {
          // Kazanan zaten varsa, bu kişi sadece bitirmiş olur
          socket.emit("playerFinishedLate"); 
        }
      } else {
        // Sonraki soruya geçmesi için bilgi ver
        socket.emit("nextQuestion", player.currentQuestionIndex);
      }

    } else {
      // YANLIŞ CEVAP - ELENDİ
      player.eliminated = true;
      socket.emit("youAreEliminated");
    }
    
    broadcastUpdate();
  });

  // 5. ÇIKIŞ YAPANLAR
  socket.on("disconnect", () => {
    delete players[socket.id];
    broadcastUpdate();
  });
});

// Yardımcı Fonksiyon: Tüm verileri ilgili kişilere dağıt
function broadcastUpdate() {
  const playerList = Object.values(players).filter(p => p.role === "player");
  
  // 1. Öğretmene DETAYLI liste gönder
  const adminSocket = Object.values(players).find(p => p.role === "admin");
  if (adminSocket) {
    io.to(adminSocket.id).emit("adminData", { 
      players: playerList, 
      gameStatus,
      totalQuestions: questions.length
    });
  }

  // 2. Bekleme ekranındaki oyunculara sadece sayı gönder
  io.emit("playerCountUpdate", playerList.length);
}

server.listen(process.env.PORT || 3000, () => {
  console.log("Proje Sunucusu Çalışıyor!");
});

