<script>
  import { afterUpdate, onMount } from "svelte";
  import { socket } from "./stores/socket";
  import { levels } from "./stores/levels";
  import { cleanUrl } from "./helpers/cleanUrl";

  import Search from "./components/Search.svelte";
  import LevelLayout from "./components/LevelLayout.svelte";
  import Site from "./components/Site.svelte";
  import FetchingLink from "./components/FetchingLink.svelte";

  export let backend;

  onMount(async () => {
    await socket.initialize(backend);
    levels.subscribeToCrawler();
  });

  afterUpdate(() => {
    window.setTimeout(() => {
      window.scrollBy({ top: 0, left: 400, behavior: "smooth" });
    }, 300);
  });
</script>

<div class="main" style="width: {$levels.levels.length * 400}px;">
  {#each $levels.levels as level, index}
    {#if index === 0 && level.length === 0 && $levels.fetching[0].length === 0}
      <LevelLayout>
        <h1>Hyperfov</h1>
        <Search />
      </LevelLayout>
    {:else}
      <LevelLayout title={`${index === 0 ? "Root" : "Level " + index}`}>
        <div class="fetching-links">
          {#each $levels.fetching[index] as fetch}
            <FetchingLink url={fetch.link} />
          {/each}
        </div>
        {#each level as site (site.url)}
          <Site
            {...site}
            chosen={$levels.highlighted.includes(cleanUrl(site.url))}
          />
        {/each}
        {#if level.length === 0 && $levels.fetching[index].length === 0}
          <div>No links found.</div>
        {/if}
      </LevelLayout>
    {/if}
  {/each}
</div>

<style>
  .main {
    justify-content: center;
    display: flex;
    min-height: 100vh;
    min-width: 100vw;
  }

  .fetching-links {
    margin-bottom: 25px;
  }

  h1 {
    font-size: 5rem;
    font-style: italic;
    margin-bottom: 30px;
    /* background-image: radial-gradient(rgb(27, 38, 133), black); */
    /* box-shadow: 0px 0px 40px rgb(27, 38, 133); */
  }
</style>
