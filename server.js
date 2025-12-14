const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

// --- 30 SORULUK SORU SETİ ---
const questions = [
  { q: "Doğum sonrası emziren kadınlarda, östrojen nedeniyle önerilmeyen yöntem hangisidir?", options: ["Sadece progesteron içeren implant", "DMPA", "Kondom", "Kombine oral kontraseptifler", "Bakırlı RİA"], answer: 3 },
  { q: "Emziren kadınlarda sadece progesteron içeren yöntemlere doğumdan ne zaman başlanabilir?", options: ["Hemen", "2 hafta sonra", "6 hafta sonra", "3 ay sonra", "6 ay sonra"], answer: 2 },
  { q: "Doğum sonrası emzirmeyen kadınlar aile planlaması yöntemine ne zaman başlayabilir?", options: ["Doğumdan 2 ay sonra", "Doğumdan hemen veya 3 hafta sonra", "Doğumdan 6 ay sonra", "Sadece adet sonrası", "Sadece 40. günden sonra"], answer: 1 },
  { q: "Doğum sonrası kondom kullanımının en önemli nedeni nedir?", options: ["Sütü artırması", "Yan etkilerinin olmaması", "Uzun etkili yönteme geçinceye kadar koruma sağlaması", "Rahim kasılmalarını azaltması", "Ekonomik olması"], answer: 2 },
  { q: "Doğum sonrası diyafram ve servikal başlık kullanımı için kaç hafta beklenmelidir?", options: ["2 hafta", "3 hafta", "4 hafta", "6 hafta", "8 hafta"], answer: 3 },
  { q: "Komplikasyonsuz isteyerek düşük sonrası aşağıdaki yöntemlerden hangisine hemen başlanabilir?", options: ["Doğal yöntemler", "KOK", "Doğurganlık takibi", "Servikal başlık", "Annelik planlama testi"], answer: 1 },
  { q: "Düşük sonrası başlanmaması gereken yöntem hangisidir?", options: ["Kondom", "RİA", "İmplant", "Doğal aile planlaması yöntemleri", "DMPA"], answer: 3 },
  { q: "Gençlerin yöntem kullanırken yaşadığı en büyük sorunlardan biri nedir?", options: ["Yöntemlerin çok pahalı olması", "Aile ve arkadaşlarının fark etmesinden endişe duymaları", "Sağlık çalışanına güvenmemeleri", "Sağlık kuruluşuna gidememeleri", "Ovulasyon takibini bilmemeleri"], answer: 1 },
  { q: "Gençlerde 18 yaş altında ilk seçenek olmayan yöntem aşağıdakilerden hangisidir?", options: ["Kondom", "Diyafram", "Spermisit", "Sadece progesteron içeren enjekte edilen yöntemler", "KOK"], answer: 3 },
  { q: "20 yaş altındaki nulliparlarda ilk seçenek olmayan yöntem hangisidir?", options: ["Kondom", "KOK", "DMPA", "Cu-RİA", "Mini hap"], answer: 3 },
  { q: "Gençlerde CYBE riskine karşı en etkili koruma hangi kombinasyonda sağlanır?", options: ["KOK tek başına", "Diyafram + spermisit", "Kondom + KOK", "RİA + KOK", "İmplant + KOK"], answer: 2 },
  { q: "Gençlerde sigara kullanımına bağlı olarak hangi KOK türü önerilir?", options: ["50 µg östrojen içeren", "35 µg östrojen içeren", "20 µg etinil östradiol içeren", "Sadece östrojen içeren", "Östrojen içermeyen"], answer: 2 },
  { q: "Menopoz döneminde gebelik riskinin devam etmesinin nedeni nedir?", options: ["Kadının süt üretmesi", "Rahmin büyümesi", "Düzensiz ovulasyon nedeniyle yumurtlamanın devam edebilmesi", "Foliküllerin artması", "Endometriumun incelmesi"], answer: 2 },
  { q: "Aşağıdakilerden hangisi menopoz yaşı için doğrudur?", options: ["Türkiye’de ortalama 35", "Dünya genelinde 40", "Türkiye’de ortalama 50", "55–60 arası değişir", "Sigara içmek menopoz yaşını yükseltir"], answer: 2 },
  { q: "Acil kontrasepsiyon ile ilgili yanlış olan ifade hangisidir?", options: ["Gebeliği büyük ölçüde önler", "%99 etkilidir", "RİA kullanılabilir", "Gebelik oluştuktan sonra etkilidir", "Tecavüz durumunda özenli danışmanlık gerekir"], answer: 3 },
  { q: "Acil kontrasepsiyonun tek kontrendikasyonu nedir?", options: ["Emzirme", "Genç yaş", "Sadece progesteron kullanımı", "Gebelik", "Doğumsal uterin anomaliler"], answer: 3 },
  { q: "Acil kontrasepsiyonda RİA'nın etkisi nedir?", options: ["Endometrium kalınlaştırır", "Fertilizasyonu ve implantasyonu önler", "Ovulasyonu durdurur", "Serviks mukusunu inceltir", "Progesteronu artırır"], answer: 1 },
  { q: "Gençlerin cinselliği çoğu zaman hangi ihtiyaca dayanır?", options: ["Anne olma isteği", "Fiziksel zorunluluk", "Kabul edilme veya şefkat ihtiyacı", "Aile baskısından kaçınma", "Sosyal medya etkisi"], answer: 2 },
  { q: "Zeka engelli kişiler için aile planlaması hizmetlerinde öncelik hangisidir?", options: ["Yöntemi gizlemek", "Danışmanlığın onların anlayacağı şekilde verilmesi", "Yüksek doz hormon tercih etmek", "Sadece kondom vermek", "Kalıcı yöntem zorunluluğu"], answer: 1 },
  { q: "Doğum sonrası kombine enjekte edilen kontraseptifler en erken ne zaman başlanabilir?", options: ["Doğumdan hemen", "1 hafta sonra", "2 hafta sonra", "3 hafta sonra", "3 ay sonra"], answer: 3 },
  { q: "Düşük sonrası kadınlara aile planlaması danışmanlığı ne zaman verilmelidir?", options: ["Sadece taburcu olurken", "Adet olunca", "Düşükten önce, hemen sonra veya kontrolde", "6 hafta sonra", "Yöntem istediğinde"], answer: 2 },
  { q: "Acil kontrasepsiyon aşağıdakilerden hangisidir?", options: ["Düzenli bir aile planlaması yöntemi", "İstenmeyen gebeliği önlemek için kullanılan geçici yöntem", "Kalıcı çözüm", "Sadece gençlere önerilen yöntem", "Aile planlaması dışı bir uygulama"], answer: 1 },
  { q: "Acil kontrasepsiyonda etkililik neden zamanla azalır?", options: ["Rahim küçülür", "Fertilizasyon ve implantasyon zamanla gerçekleşebilir", "Ovulasyon durur", "Hormonlar artar", "Servikste kuruluk olur"], answer: 1 },
  { q: "Aşağıdakilerden hangisi gençlerde yöntem seçiminde önemli bir zorluktur?", options: ["Sağlık çalışanına ulaşamamak", "Düzenli uygulama gerektiren yöntemlerden kaçınmaları", "Aile onayının zorunlu olması", "Yöntem fiyatlarının yüksek olması", "İç salgı bozukluğu"], answer: 1 },
  { q: "Perimenopozdaki bir kadında gebelik neden risklidir?", options: ["Serviks çok dar olduğu için", "Kan değerleri düşük olduğu için", "Anne ve bebek için komplikasyon riski arttığı için", "Doğum kanaması olmadığı için", "FSH düşük olduğu için"], answer: 2 },
  { q: "Gençlerde istenmeyen cinsel davranışların bir nedeni nedir?", options: ["Erken menopoz", "Vitamin eksikliği", "Zorla veya baskı ile ilişkiye maruz kalma", "Ovulasyon bozukluğu", "Uygun partner bulamama"], answer: 2 },
  { q: "Aşağıdakilerden hangisi aile planlaması yöntemlerinin gençlerde kullanılabilirliği hakkında doğrudur?", options: ["Çoğu yöntemi kullanamazlar", "RİA gençlerde yasaktır", "Mevcut tüm yöntemler kullanılabilir, ancak bazıları ilk seçenek değildir", "Sadece kondom uygundur", "Sadece hormonal yöntem uygundur"], answer: 2 },
  { q: "Eczanelerin aile planlaması hizmetlerinde avantajlarından biri değildir?", options: ["Yakın ve hızlı hizmet", "Farklı marka seçenekleri", "Tanıdık olmayan ortam", "Kalıcı yöntem yapabilmesi", "Ücretsiz bilgi ve öneri verilmesi"], answer: 3 },
  { q: "Acil kontrasepsiyonun yaygın kullanımı neyi sağlar?", options: ["Süt üretimini artırır", "Ovulasyonu düzenler", "Milyonlarca istenmeyen gebeliğin oluşmadan önlenmesi", "Regl düzenini düzeltir", "RİA kullanımını azaltır"], answer: 2 },
  { q: "Eczanelerin aile planlamasında rolü ile ilgili doğru ifade hangisidir?", options: ["Gebeliği önleyici yöntemler sadece doktor tarafından verilebilir", "Eczanelerde hekime gitmeden gebelikten korunma ürünleri alınabilir", "Eczaneler sadece KOK satar", "Danışmanlık ücretlidir", "Gençlere hizmet vermezler"], answer: 1 }
];

let players = {}; 
let gameStatus = "waiting"; 
let winner = null;
let adminId = null; 

io.on("connection", (socket) => {
  
  // Yeni gelen kişiye admin var mı bilgisini gönder
  socket.emit("adminStatus", { hasAdmin: adminId !== null });

  // OYUNCU GİRİŞİ
  socket.on("joinGame", (name) => {
    players[socket.id] = {
      id: socket.id,
      name: name,
      role: "player",
      currentQuestionIndex: 0,
      eliminated: false,
      finished: false,
      joinTime: Date.now() 
    };
    broadcastUpdate();
  });

  // YÖNETİCİ GİRİŞİ
  socket.on("joinAsAdmin", () => {
    if (adminId !== null && adminId !== socket.id) return;
    
    adminId = socket.id;
    players[socket.id] = { id: socket.id, name: "Yönetici", role: "admin" };
    
    io.emit("adminStatus", { hasAdmin: true });
    
    // BURASI DÜZELTİLDİ: Oyuncu listesini array olarak gönderiyoruz
    const playerList = Object.values(players).filter(p => p.role === "player");
    socket.emit("adminData", { players: playerList, gameStatus, totalQuestions: questions.length });
  });

  // BAŞLAT
  socket.on("startGame", () => {
    gameStatus = "playing";
    winner = null;
    // Tüm oyuncuları sıfırla
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

  // CEVAPLAMA
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
          finishGame(player.name); 
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
    
    checkIfAllEliminated();
    broadcastUpdate();
  });

  // ÇIKIŞ
  socket.on("disconnect", () => {
    if (socket.id === adminId) {
      adminId = null;
      io.emit("adminStatus", { hasAdmin: false }); 
    }
    
    delete players[socket.id];
    if (gameStatus === "playing") checkIfAllEliminated();
    broadcastUpdate();
  });
});

// KİMSE KALDI MI KONTROLÜ
function checkIfAllEliminated() {
  if (gameStatus !== "playing") return;

  const playerList = Object.values(players).filter(p => p.role === "player");
  if (playerList.length === 0) return; 

  const activePlayers = playerList.filter(p => !p.eliminated && !p.finished).length;

  if (!winner && activePlayers === 0) {
    finishGame(null); 
  }
}

// OYUNU BİTİR
function finishGame(winnerName) {
  gameStatus = "finished";
  winner = winnerName;

  const playerList = Object.values(players).filter(p => p.role === "player");
  
  const leaderboard = playerList.sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return b.currentQuestionIndex - a.currentQuestionIndex;
  }).map(p => ({
    name: p.name,
    score: p.currentQuestionIndex,
    status: p.finished ? "finished" : (p.eliminated ? "eliminated" : "active")
  }));

  io.emit("gameOver", { 
    winnerName: winnerName, 
    noWinner: winnerName === null,
    leaderboard: leaderboard 
  });
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
  console.log("Sunucu Başladı...");
});
