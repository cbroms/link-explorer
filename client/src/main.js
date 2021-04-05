import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    backend: "ws://localhost:3000",
  },
});

export default app;
