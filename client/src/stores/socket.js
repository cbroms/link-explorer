import io from "socket.io-client";
import { writable } from "svelte/store";

const createSocket = () => {
  let triedSetup = false;

  const { subscribe, set, update } = writable(null);

  const initialize = (connection) => {
    return new Promise((resolve) => {
      if (!triedSetup) {
        const socket = io.connect(`${connection}`, {
          reconnect: true,
        });

        socket.on("connect", () => {
          set(socket);
          resolve();
        });

        socket.on("disconnect", () => {
          set(socket);
        });

        set(socket);
      }
    });
  };

  return {
    subscribe,
    initialize,
  };
};

export const socket = createSocket();
