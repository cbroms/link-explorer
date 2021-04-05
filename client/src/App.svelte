<script>
  import { onMount } from "svelte";
  import { io } from "socket.io-client";

  export let backend;

  let locationToScrape = "";
  let error = "";

  let socket = { connected: false };

  onMount(() => {
    socket = io(backend);
  });

  const handleSearch = () => {
    if (locationToScrape !== "") {
      locationToScrape = "";
      error = "";
      socket.emit("scrapeLocation", { url: locationToScrape });
      socket.on("scrapeLocationError", (data) => {
        error = data.error;
      });
    }
  };
</script>

<main>
  <h1>Hi</h1>
  <input type="text" bind:value={locationToScrape} />
  <button on:click={handleSearch}>Search</button>
  <div>{error}</div>
</main>

<style>
</style>
