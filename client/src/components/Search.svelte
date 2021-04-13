<script>
  import { levels } from "../stores/levels";

  let locationToScrape = "";
  let error = "";

  const handleSearch = () => {
    if (locationToScrape !== "") {
      try {
        new URL(locationToScrape);
        levels.startCrawler(locationToScrape);
      } catch (e) {
        error = "Invalid URL.";
      }

      //   socket.emit("scrapeLocation", { url: locationToScrape });
      //   socket.on("scrapeLocationError", (data) => {
      //     error = data.error;
      //   });
      locationToScrape = "";
    }
  };
</script>

<input
  type="text"
  placeholder="https://example.com"
  bind:value={locationToScrape}
/>

<button on:click={handleSearch}>Explore &rarr;</button>
<div class="error">{error}</div>

<style>
  input {
    margin-top: 40px;
  }
</style>
