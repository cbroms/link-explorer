<script>
  import { slide } from "svelte/transition";

  export let url;
  export let src;
</script>

<div transition:slide class="site-result">
  <img {src} alt={url} />
  <a class="truncated-link" href={url} target="_blank">{url}</a>
</div>

<style>
  .site-result {
    margin-bottom: 25px;
  }
</style>
