const puppeteer = require("puppeteer");
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
  },
});

const { scrape, scrapeList } = require("./helpers/scraper");
const { blacklist } = require("./helpers/blacklist");

let browser;

const visitedDomainsSets = {};

io.on("connection", (socket) => {
  console.log("client connected!");

  visitedDomainsSets[socket.id] = new Set(blacklist);

  // handle the event sent with socket.emit()
  socket.on("scrapeLocation", (data) => {
    let url;
    try {
      url = new URL(data.url);
    } catch {
      socket.emit("scrapeLocationError", { error: "Invalid URL." });
    }
    console.log(data.url);
    // the url is valid; start scraping
    scrape(
      socket,
      browser,
      data.parent || null,
      data.url,
      visitedDomainsSets[socket.id],
      0
    );
  });

  // when there's a list of links we want to scrape at once
  socket.on("scrapeLocationContinue", (data) => {
    // assuming the urls are valid; start scraping
    scrapeList(
      socket,
      browser,
      data.parent || null,
      data.urls,
      visitedDomainsSets[socket.id]
    );
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
    delete visitedDomainsSets[socket.id];
  });
});

(async () => {
  browser = await puppeteer.launch();
  httpServer.listen(3000);
  console.log("server listening on port 3000");
  // await browser.close();
})();
