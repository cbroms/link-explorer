<script>
  import { fly } from "svelte/transition";

  export let title = "";
</script>

<div
  in:fly={{ x: 300, duration: 800, delay: 400 }}
  out:fly={{ x: -300, duration: 400 }}
>
  <h3>{title}</h3>
  <slot />
</div>

<style>
  div {
    padding: 20px;
    width: 400px;
    height: 100vh;
    overflow-y: scroll;
    border-left: 1px solid;
  }
</style>
