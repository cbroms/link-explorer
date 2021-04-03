const url = require("url");
const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");
const puppeteer = require("puppeteer");

const scrapeLinks = async (page, location, originsToIgnore) => {
  try {
    const thisLinkOrigin = new URL(location).origin;

    await page.goto(location, {
      waitUntil: "networkidle2",
    });
    //await page.screenshot({ path: "example.png" });
    // get all the links on the page
    const hrefs = await page.$$eval("a", (links) =>
      links.map((link) => link.href)
    );
    await page.close();
    // filter out any links that are from the same site or any of the previous sites we've visited
    const filteredHrefs = hrefs.filter((link) => {
      const linkOrigin = new URL(link).origin;
      return (
        linkOrigin !== null &&
        linkOrigin !== "null" &&
        linkOrigin !== thisLinkOrigin &&
        originsToIgnore[thisLinkOrigin] !== true
      );
    });
    return filteredHrefs;
  } catch {
    // something went wrong
    return [];
  }

  //   const res = await fetch(location).then((v) => v.text());
  //   const root = HTMLParser.parse(res);
  //   const links = root.querySelectorAll("a");

  //   const { origin, pathname } = new URL(location);

  //   const hrefs = [];

  //   for (const link of links) {
  //     let href = link.getAttribute("href");
  //     if (href && href.charAt(0) === "/") href = origin + href;
  //     else if (href && href.charAt(0) === "#") href = origin + pathname + href;

  //     if (href) hrefs.push(href);
  //   }

  //   console.log(hrefs);
};

const maxDepth = 2;
const start = "https://www.molleindustria.org/";

const recursivelyScrape = async (browser, location, originsToIgnore, depth) => {
  if (depth > maxDepth) return;
  else {
    console.log(`getting links from ${location}...`);

    // scape the links from the page
    const page = await browser.newPage();
    const links = await scrapeLinks(page, location, originsToIgnore);
    console.log(links);
    console.log(`found ${links.length}`);

    // don't return to this website
    const thisLinkOrigin = new URL(location).origin;
    originsToIgnore[thisLinkOrigin] = true;

    // for each valid link, recursively scrape it
    for (const link of links) {
      await recursivelyScrape(browser, link, originsToIgnore, depth + 1);
    }
  }
};

(async () => {
  const browser = await puppeteer.launch();
  const results = await recursivelyScrape(browser, start, [], 0);
  await browser.close();
})();
