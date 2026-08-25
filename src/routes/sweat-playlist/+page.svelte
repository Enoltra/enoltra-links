<script>
  import { onMount } from 'svelte';

  const TRACK_DEEP_LINK = 'https://open.spotify.com/track/3iCUZ7QWfNVyNCnAuYj0BH?context=spotify:playlist:0tE4yEqcF5tNUXKoqJHcC1';
  const EMBED_URL = 'https://open.spotify.com/embed/playlist/0tE4yEqcF5tNUXKoqJHcC1?utm_source=generator&theme=0';

  function trackClick() {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'PlaylistClick', { playlist: 'sweat' });
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', { content_name: 'Sweat Playlist Landing' });
    }
  });
</script>

<svelte:head>
  <title>Sweat — The Playlist | Enoltra</title>
  <meta name="description" content="Hard-hitting techno & bounce, built for the peak hour. Listen to the Sweat playlist on Spotify." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@600;800&family=Dela+Gothic+One&display=swap" rel="stylesheet">
</svelte:head>

<div class="page">
  <div class="hero">
    <img src="/sweat-playlist.webp" alt="Sweat Playlist" class="cover" />
  </div>

  <div class="content">
    <h1>SWEAT</h1>
    <p class="subhead">Hard-hitting techno &amp; bounce, built for the peak hour.</p>

    <a
      class="cta"
      href={TRACK_DEEP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      on:click={trackClick}
    >
      Listen on Spotify
    </a>

    <div class="embed-wrapper">
      <iframe
        title="Sweat Playlist"
        src={EMBED_URL}
        width="100%"
        height="352"
        frameborder="0"
        allowfullscreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  </div>

  <footer class="site-footer">
    <p>© Designed by Enoltra</p>
  </footer>
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; }
  :global(html, body) { margin: 0; padding: 0; background-color: #2B2FC6; }

  .page {
    max-width: 500px;
    margin: 0 auto;
    background-color: #2B2FC6;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .hero { width: 100%; }
  .cover { display: block; width: 100%; aspect-ratio: 1 / 1; object-fit: cover; }

  .content { padding: 24px 6%; flex-grow: 1; text-align: center; }

  h1 {
    font-family: 'Dela Gothic One', sans-serif;
    font-weight: 400;
    font-size: 2.4rem;
    color: #C1FF72;
    margin: 0 0 8px 0;
    letter-spacing: 1px;
  }

  .subhead {
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 600;
    font-size: 1.1rem;
    color: #fff;
    opacity: 0.9;
    margin: 0 0 24px 0;
    line-height: 1.4;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px 24px;
    border-radius: 999px;
    background-color: #C1FF72;
    color: #2B2FC6;
    font-family: 'Dela Gothic One', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    text-decoration: none;
    text-transform: none;
    transition: all 0.2s;
    margin-bottom: 24px;
  }

  .cta:hover { background-color: #fff; color: #2B2FC6; }

  .embed-wrapper {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
  }

  .embed-wrapper iframe { display: block; border: none; }

  .site-footer { padding: 1.5rem 0; text-align: center; font-size: 0.8rem; }
  .site-footer p { color: #C1FF72; opacity: 0.8; margin: 0; }
</style>
