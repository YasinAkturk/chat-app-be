const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);  // Socket.IO'yu bağladık

require("dotenv").config();
require("./src/db/dbConnection");
const port = process.env.PORT || 5002;
const router = require("./src/routers");
const errorHandlerMiddleware = require("./src/middlewares/errorHandler");
const cors = require("cors");
const corsOptions = require("./src/helpers/corsOptions");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const apiLimiter = require("./src/middlewares/rateLimit");
const moment = require("moment-timezone");

moment.tz.setDefault("Europe/Istanbul");

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(__dirname));

app.use(cors(corsOptions));
app.use("/api", apiLimiter);
app.use(mongoSanitize({ replaceWith: "_" }));

// Socket.IO Bağlantısı
io.on("connection", (socket) => {
  console.log("Yeni bir kullanıcı bağlandı");

  socket.on("sendMessage", (message) => {
    console.log("Mesaj alındı: ", message);
    io.emit("receiveMessage", message);  // Mesajı tüm kullanıcılara gönder
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı bağlantısı kesildi");
  });
});

// Routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.json({
    message: "Hoş Geldiniz",
  });
});

// Error handling middleware
app.use(errorHandlerMiddleware);

// Sunucu başlatma
server.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor ...`);
});