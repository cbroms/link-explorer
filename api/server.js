const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("client connected!");
  // handle the event sent with socket.emit()
  socket.on("scrapeLocation", (data) => {
    let url;
    try {
      url = new URL(data.url);
    } catch {
      socket.emit("scrapeLocationError", { error: "Invalid URL." });
    }
  });
});

httpServer.listen(3000);
console.log("server listening on port 3000");
