const getDomain = (location) => {
  const hostname = new URL(location).host;
  if (hostname === null || hostname === "") return null;
  return hostname;
};

// remove the trailing "/"
const standardizeUrl = (url) => {
  if (url !== null && url.charAt(url.length - 1) === "/")
    return url.substring(0, url.length - 1);
  return url;
};

const scrapeLinks = (
  socket,
  page,
  parentLocation,
  location,
  visitedDomains
) => {
  return new Promise(async (resolve) => {
    let done = false;

    // if we haven't completed in 45s, consider to have timed out and return
    setTimeout(async () => {
      if (!done) {
        console.log("timeout", location);
        // tell  the client we failed
        socket.emit("resultFail", {
          url: standardizeUrl(location),
          parentUrl: standardizeUrl(parentLocation),
        });
        // try {
        //   await page.close();
        // } catch {
        //   // if this fails for whatever reason it's fine
        // }
        resolve([]);
      }
    }, 45000);

    // fetch the page, screenshot it, scrape links, clean links, and emit results
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

      const buf = await page.screenshot({ encoding: "base64" });

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

      // remove dupes
      let finalHrefs = [...new Set(filteredHrefs)];

      finalHrefs = finalHrefs.map((href) => standardizeUrl(href));

      console.log(finalHrefs);
      // send the page screenshot and urls to the client
      socket.emit("result", {
        buffer: buf.toString("base64"),
        url: standardizeUrl(settledLocation),
        parentUrl: standardizeUrl(parentLocation),
        links: finalHrefs,
      });

      resolve(finalHrefs);
      done = true;
    } catch (e) {
      // something went wrong
      console.error(e);

      // tell  the client we failed
      socket.emit("resultFail", {
        url: standardizeUrl(location),
        parentUrl: standardizeUrl(parentLocation),
      });

      resolve([]);
      done = true;
    }
  });
};

const maxDepth = 1;

const recursivelyScrape = async (
  socket,
  browser,
  parentLocation,
  location,
  visitedDomains,
  depth
) => {
  if (depth > maxDepth) return;
  else {
    try {
      const thisLocationDomain = getDomain(location);
      if (thisLocationDomain === null) throw new Error("Bad location");

      console.log(`getting links from ${location}...`);

      // scape the links from the page
      const page = await browser.newPage();
      const links = await scrapeLinks(
        socket,
        page,
        parentLocation,
        location,
        visitedDomains
      );
      console.log(`links from ${location}:`);
      console.log(links);
      console.log(`found ${links.length}`);

      // don't return to this website
      visitedDomains.add(thisLocationDomain);

      // for each valid link, recursively scrape it
      const scrapers = links.map((link) => {
        return recursivelyScrape(
          socket,
          browser,
          location,
          link,
          visitedDomains,
          depth + 1
        );
      });

      // scrape the pages in parallel
      await Promise.allSettled(scrapers);

      if (depth === 0) {
        console.log("complete");
      }
      return;
    } catch (e) {
      // the url could be bad
      console.error(e);
    }
  }
};

module.exports = {
  recursivelyScrape,
};
