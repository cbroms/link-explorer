<script>
  import { slide } from "svelte/transition";

  export let url;
  export let src;
</script>

<div transition:slide class="site-result">
  <div class="image-wrapper"><img {src} alt={url} /></div>
  <a class="truncated-link" href={url} target="_blank">{url}</a>
</div>

<style>
  .site-result {
    margin-bottom: 25px;
  }

  img:hover {
    filter: blur(5px);
  }

  img {
    filter: blur(0px);
    transition: filter 1s;
    margin: -5px -10px -10px -5px;
  }

  .image-wrapper {
    overflow: hidden;
  }
</style>
