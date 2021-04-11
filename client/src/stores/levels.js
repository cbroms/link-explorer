import { createDerivedSocketStore } from "./helpers/createDerivedSocketStore";
import { socket } from "./socket";

const defaultState = {
  currentlyScraping: {},
  levelMap: {}, // url to level number e.g. https://example.com -> 2
  levels: [[]],
  fetching: { 0: [] }, // level number to array of links being fetched
};

const fakeState = {
  levels: [[], []],
  fetching: {
    0: ["http://likelike.org"],
    1: [
      "https://likelike3d.herokuapp.com",
      "https://likelike.glitch.me",
      "https://twitter.com/likelikearcade",
      "https://www.facebook.com/likelikearcade",
      "http://likelike3d.herokuapp.com",
      "https://twitch.tv/molleindustria",
      "http://likeliketext.glitch.me",
      "https://twitter.com/von_rostock/status/1222315759734534145",
      "https://candle.itch.io/world-of-bitsy",
      "http://jessestil.es",
      "https://wordpress.org",
    ],
  },
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
            currentlyScraping: { ...s.currentlyScraping, [url]: true },
            levels: [...s.levels, []],
            fetching: { ...s.fetching, 0: [url], 1: [] },
          };
        });
        socket.on("scrapeLocationError", (data) => {
          //TODO deal with this error
          error = data.error;
        });
        socket.on("scrapeLocationComplete", (data) => {
          if (data.url === url) {
            update((s) => {
              return {
                ...s,
                currentlyScraping: {
                  ...s.currentlyScraping,
                  [data.url]: false,
                },
              };
            });
          }
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

            // add the site info to the levels array
            const newLevels = [...s.levels];
            newLevels[thisLevel] = [
              { src, url: data.url, links: data.links },
              ...newLevels[thisLevel],
            ];

            const newFetching = { ...s.fetching };
            if (thisLevel === 0) {
              // we got the OG, so add the list of things being fetched
              newFetching[1] = data.links;
            }
            // we've fetched the url, so remove it from the list of things being fetched
            newFetching[thisLevel] = newFetching[thisLevel].filter(
              (url) => url !== data.url
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
      };
    },
  },
  defaultState
);
