const puppeteer = require("puppeteer");
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
  },
});

const { recursivelyScrape } = require("./helpers/scraper");

let browser;

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
    const visitedDomains = new Set();
    console.log(data.url);
    // the url is valid; start scraping
    recursivelyScrape(socket, browser, data.url, visitedDomains, 0);
  });
});

(async () => {
  browser = await puppeteer.launch();
  httpServer.listen(3000);
  console.log("server listening on port 3000");
  // await browser.close();
})();
