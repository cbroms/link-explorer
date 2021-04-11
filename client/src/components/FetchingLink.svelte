<script>
  import { fade, fly } from "svelte/transition";
  export let url;
</script>

<div out:fly={{ y: 200 }} in:fade>
  <div class="loader" />
  <a class="truncated-link" href={url} target="_blank">{url}</a>
</div>

<style>
  @keyframes ballMove {
    0% {
      padding-left: 0px;
      opacity: 0.5;
    }

    50% {
      padding-left: 15px;
      opacity: 1;
    }
    100% {
      padding-left: 0px;
      opacity: 0.5;
    }
  }

  @keyframes opacityMove {
    0% {
      opacity: 0.5;
    }

    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }

  .loader {
    width: 25px;
    display: inline-block;
    animation: ballMove 1s ease-in-out infinite;
  }

  .loader::after {
    content: "•";
    font-size: 20px;
    padding-bottom: 5px;
  }

  a {
    animation: opacityMove 1s ease-in-out infinite;
  }
</style>
