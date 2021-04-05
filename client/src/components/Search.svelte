<script>
  export let socket;

  let locationToScrape = "";
  let error = "";

  const handleSearch = () => {
    if (locationToScrape !== "") {
      socket.emit("scrapeLocation", { url: locationToScrape });
      socket.on("scrapeLocationError", (data) => {
        error = data.error;
      });
      locationToScrape = "";
      error = "exploring links...";
    }
  };
</script>

<input type="text" bind:value={locationToScrape} />
<button on:click={handleSearch}>Search</button>
<div>{error}</div>

<style>
</style>
