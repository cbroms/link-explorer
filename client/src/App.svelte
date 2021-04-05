<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";
  import Search from "./components/Search.svelte";

  export let backend;

  let images = [];

  let socket = { connected: false };

  onMount(() => {
    socket = io(backend);

    socket.on("image", (data) => {
      if (data.image) {
        const src = "data:image/jpeg;base64," + data.buffer;
        images = [...images, { src, url: data.url }];
      }
    });
  });
</script>

<main>
  <h1>Hi</h1>
  <Search {socket} />
  {#each images as image (image.url)}
    <img src={image.src} />
  {/each}
</main>

<style>
</style>
