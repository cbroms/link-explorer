<script>
  import { onMount } from "svelte";
  import { socket } from "./stores/socket";
  import { levels } from "./stores/levels";
  import Search from "./components/Search.svelte";
  import LevelLayout from "./components/LevelLayout.svelte";
  import Site from "./components/Site.svelte";
  import FetchingLink from "./components/FetchingLink.svelte";

  export let backend;

  onMount(async () => {
    await socket.initialize(backend);
    levels.subscribeToCrawler();
  });
</script>

<main>
  {#each $levels.levels as level, index}
    {#if index === 0 && level.length === 0 && $levels.fetching[0].length === 0}
      <LevelLayout>
        <h1>Hyperfov</h1>
        <h2>The hyperlink explorer.</h2>
        <Search />
      </LevelLayout>
    {:else}
      <LevelLayout title={`Level ${index}`}>
        <div class="fetching-links">
          {#each $levels.fetching[index] as url}
            <FetchingLink {url} />
          {/each}
        </div>
        {#each level as site (site.url)}
          <Site {...site} />
        {/each}
      </LevelLayout>
    {/if}
  {/each}
</main>

<style>
  main {
    justify-content: center;
    display: flex;
    width: auto;
    min-height: 100vh;
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
