<script>
  import { slide, fade } from "svelte/transition";
  import { levels } from "../stores/levels";
  import { onMount } from "svelte";

  export let url = "";
  export let src;
  export let links;
  export let chosen = false;

  let displayUrl = url;
  let hovering = false;

  onMount(() => {
    // just get the domain name
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    displayUrl = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  });

  const handleContinueClick = () => {
    if (!chosen) {
      levels.continueCrawler(url, links);
    }
  };
</script>

<div transition:slide={{ delay: 500 }} class="site-result">
  <div
    on:mouseenter={() => {
      if (!chosen) hovering = true;
    }}
    on:mouseleave={() => {
      if (!chosen) hovering = false;
    }}
    on:click={handleContinueClick}
    class="image-wrapper"
    class:chosen
    class:clickable={!chosen}
  >
    <img {src} alt={url} />
    {#if hovering && !chosen}
      <div transition:fade class="continue-site-prompt">
        Explore {displayUrl}'s links &rarr;
      </div>
    {/if}
  </div>
  <div class="site-result-info">
    <a class="truncated-link" href={url} target="_blank">{url}</a>
    <span>{links.length} link{links.length === 1 ? "" : "s"}</span>
  </div>
</div>

<style>
  .site-result {
    margin-bottom: 25px;
    position: relative;
  }

  .image-wrapper:hover > img {
    filter: blur(5px);
    opacity: 0.3;
  }

  .chosen {
    box-shadow: 0px 0px 40px rgb(43, 61, 219) !important;
    border: 1px solid rgb(43, 61, 219) !important;
  }

  .clickable {
    cursor: pointer;
  }

  .chosen:hover > img {
    filter: blur(0px) !important;
    opacity: 1 !important;
  }

  .image-wrapper:hover {
    box-shadow: 0px 0px 40px rgb(43, 61, 219);
    border: 1px solid rgb(43, 61, 219);
  }

  .image-wrapper > img {
    filter: blur(0px);
    opacity: 1;
    vertical-align: middle;
    transition: filter 0.5s ease-out, opacity 0.5s ease-out;
    /* margin: -5px -10px -10px -5px; */
  }

  .image-wrapper {
    overflow: hidden;
    background-color: rgb(43, 61, 219);
    box-shadow: none;
    border: 1px solid black;
    transition: box-shadow 0.5s ease-out, border 0.5s ease-out;
  }

  .continue-site-prompt {
    position: absolute;
    top: calc(50% - 10px);
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
    padding: 20px;
  }

  .site-result-info {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    opacity: 0.5;
  }
</style>
