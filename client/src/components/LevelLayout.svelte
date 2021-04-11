<script>
  export let title = "";
</script>

<div>
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
