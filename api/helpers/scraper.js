const puppeteer = require("puppeteer");

const getDomain = (location) => {
  const hostname = new URL(location).hostname;
  if (hostname === null || hostname === "") return null;
  const parts = hostname.split(".");
  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
};

const scrapeLinks = async (page, location, visitedDomains) => {
  try {
    const thisLinkDomain = getDomain(location);
    if (thisLinkDomain === null) throw new Error("Bad location");

    visitedDomains.add(thisLinkDomain);
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
    const settledDomain = getDomain(settledLocation);
    visitedDomains.add(settledDomain);

    //await page.screenshot({ path: "example.png" });
    // get all the links on the page
    const hrefs = await page.$$eval("a", (links) =>
      links.map((link) => link.href)
    );
    await page.close();
    // filter out any links that are from the same site or any of the previous sites we've visited
    const filteredHrefs = hrefs.filter((link) => {
      const linkDomain = getDomain(link);
      return (
        linkDomain !== null &&
        linkDomain !== thisLinkDomain &&
        !visitedDomains.has(linkDomain)
      );
    });
    return filteredHrefs;
  } catch {
    // something went wrong
    return [];
  }
};

const maxDepth = 2;
const start = "https://www.molleindustria.org/";

const recursivelyScrape = async (browser, location, visitedDomains, depth) => {
  if (depth > maxDepth) return;
  else {
    const thisLocationDomain = getDomain(location);
    if (thisLocationDomain === null) return;

    console.log(`getting links from ${location}...`);

    // scape the links from the page
    const page = await browser.newPage();
    const links = await scrapeLinks(page, location, visitedDomains);
    console.log(`links from ${location}:`);
    console.log(links);
    console.log(`found ${links.length}`);

    // don't return to this website
    visitedDomains.add(thisLocationDomain);

    // for each valid link, recursively scrape it
    const scrapers = links.map((link) => {
      return recursivelyScrape(browser, link, visitedDomains, depth + 1);
    });

    return await Promise.allSettled(scrapers);
  }
};

(async () => {
  const browser = await puppeteer.launch();
  const visitedDomains = new Set();
  const results = await recursivelyScrape(browser, start, visitedDomains, 0);
  await browser.close();
})();
