import { createDerivedSocketStore } from "./helpers/createDerivedSocketStore";
import { cleanUrl } from "../helpers/cleanUrl";
import { socket } from "./socket";

const defaultState = {
  levelMap: {}, // url to level number e.g. https://example.com -> 2
  levels: [[]],
  fetching: { 0: [] }, // level number to array of links being fetched
  highlighted: [],
};

export const levels = createDerivedSocketStore(
  socket,
  {
    startCrawler: (url, resolve) => {
      return (socket, update) => {
        //  start scraping
        socket.emit("scrapeLocation", { url });
        update((s) => {
          return {
            ...s,
            fetching: {
              ...s.fetching,
              0: [{ clean: cleanUrl(url), link: url }],
              1: [],
            },
            highlighted: [cleanUrl(url)],
          };
        });
        socket.on("scrapeLocationError", (data) => {
          //TODO deal with this error
          error = data.error;
        });
      };
    },
    continueCrawler: (parent, urls) => {
      return (socket, update) => {
        // since this is a continuation, we should already have the links for the location
        // console.log(parent, urls);
        //  start scraping, passing in the parent
        socket.emit("scrapeLocationContinue", { parent, urls });
        update((s) => {
          const thisLevel = s.levelMap[parent] + 1;

          // add a new level if one hasn't already been added
          const newLevels = [...s.levels];
          if (newLevels.length - 1 === thisLevel - 1) newLevels.push([]);

          // format links that are being fetched
          // TODO display the links that aren't being fetched somewhere
          const formattedFetchingUrls = urls.slice(0, 10).map((url) => {
            return { clean: cleanUrl(url), link: url };
          });

          // add the urls to the list of things being fetched
          const newFetchingLevel =
            s.fetching[thisLevel] !== undefined
              ? [...s.fetching[thisLevel], ...formattedFetchingUrls]
              : [...formattedFetchingUrls];

          return {
            ...s,
            fetching: {
              ...s.fetching,
              [thisLevel]: newFetchingLevel,
            },
            highlighted: [...s.highlighted, cleanUrl(parent)],
            levels: newLevels,
          };
        });
      };
    },
    subscribeToCrawler: () => {
      return (socket, update) => {
        socket.on("result", (data) => {
          //   console.log("result", data);
          // we get the image in base64
          const src = "data:image/jpeg;base64," + data.buffer;

          update((s) => {
            // which level should this site go?
            const thisLevel =
              data.parentUrl === null ? 0 : s.levelMap[data.parentUrl] + 1;

            // console.log(thisLevel);

            // add the site info to the levels array
            const newLevels = [...s.levels];
            newLevels[thisLevel] = [
              { src, url: data.url, links: data.links },
              ...newLevels[thisLevel],
            ];

            const newFetching = { ...s.fetching };
            if (thisLevel === 0) {
              // add the next level
              newLevels.push([]);
              // we got the OG, so add the list of things being fetched
              newFetching[1] = data.links.map((link) => {
                return { clean: cleanUrl(link), link };
              });
            }
            // we've fetched the url, so remove it from the list of things being fetched
            newFetching[thisLevel] = newFetching[thisLevel].filter(
              (url) => url.clean !== cleanUrl(data.ogUrl)
            );

            return {
              ...s,
              levelMap: {
                ...s.levelMap,
                [data.url]: thisLevel, // add the new url to the map
              },
              levels: newLevels,
              fetching: newFetching,
            };
          });
        });

        socket.on("resultFail", (data) => {
          update((s) => {
            const thisLevel =
              data.parentUrl === null ? 0 : s.levelMap[data.parentUrl] + 1;

            // removed the failed link from the fetching array
            const newFetching = { ...s.fetching };
            newFetching[thisLevel] = newFetching[thisLevel].filter(
              (url) => url.clean !== cleanUrl(data.url)
            );

            return {
              ...s,
              fetching: newFetching,
            };
          });
        });
      };
    },
  },
  defaultState
);
