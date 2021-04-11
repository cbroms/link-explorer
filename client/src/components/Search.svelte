<script>
  import { levels } from "../stores/levels";

  let locationToScrape = "";
  let error = "";

  const handleSearch = () => {
    if (locationToScrape !== "") {
      levels.startCrawler(locationToScrape);
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
<button on:click={handleSearch}>Search</button>
<div>{error}</div>

<style>
</style>
