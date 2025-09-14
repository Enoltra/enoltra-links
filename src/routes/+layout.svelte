<script>
  // This imports the global styles for all your pages
  import "../app.css";
</script>

<svelte:head>
  <!-- THIS IS THE NEW LINE THAT ADDS THE FAVICON -->
  <link rel="icon" href="/favicon.ico" />
</svelte:head>

<!-- This <slot /> renders the content of your individual pages -->
<slot />