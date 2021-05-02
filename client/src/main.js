import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    backend: _app.env.API || "ws://localhost:3000",
  },
});

export default app;
