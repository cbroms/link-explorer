const url = require("url");
const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");
const puppeteer = require("puppeteer");

const getTLD = (location) => {
  const hostname = new URL(location).hostname;
  if (hostname === null || hostname === "") return null;
  const parts = hostname.split(".");
  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
};

const scrapeLinks = async (page, location, visitedTLDs) => {
  try {
    const thisLinkTLD = getTLD(location);
    if (thisLinkTLD === null) throw new Error("Bad location");

    visitedTLDs.add(thisLinkTLD);
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await page.goto(location, {
      waitUntil: "networkidle2",
    });
    // sometimes a url is a redirect, in which case we want to get the final url
    const settledLocation = page.url();
    const settledTLD = getTLD(settledLocation);
    visitedTLDs.add(settledTLD);

    //await page.screenshot({ path: "example.png" });
    // get all the links on the page
    const hrefs = await page.$$eval("a", (links) =>
      links.map((link) => link.href)
    );
    await page.close();
    // filter out any links that are from the same site or any of the previous sites we've visited
    const filteredHrefs = hrefs.filter((link) => {
      const linkTLD = getTLD(link);
      return (
        linkTLD !== null && linkTLD !== thisLinkTLD && !visitedTLDs.has(linkTLD)
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

const recursivelyScrape = async (browser, location, visitedTLDs, depth) => {
  if (depth > maxDepth) return;
  else {
    const thisLocationTLD = getTLD(location);
    if (thisLocationTLD === null) return;

    console.log(`getting links from ${location}...`);

    // scape the links from the page
    const page = await browser.newPage();
    const links = await scrapeLinks(page, location, visitedTLDs);
    console.log(`links from ${location}:`);
    console.log(links);
    console.log(`found ${links.length}`);

    // don't return to this website
    visitedTLDs.add(thisLocationTLD);

    // for each valid link, recursively scrape it
    const scrapers = links.map((link) => {
      return recursivelyScrape(browser, link, visitedTLDs, depth + 1);
    });

    return await Promise.allSettled(scrapers);
  }
};

(async () => {
  const browser = await puppeteer.launch();
  const visitedTLDs = new Set();
  const results = await recursivelyScrape(browser, start, visitedTLDs, 0);
  await browser.close();
})();
