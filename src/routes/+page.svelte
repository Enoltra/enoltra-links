<script>
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  
  let emblaApi;
  let isLoading = false; // For newsletter form

  const emblaOptions = {
    loop: true,
    plugins: [],
  };

  /** @param {any} event */
  function onEmblaInit(event) {
    emblaApi = event.detail;
  }

  /** @param {any} event */
  async function handleNewsletterSubmit(event) {
    event.preventDefault();
    if (isLoading) return;

    isLoading = true;
    const form = event.target;
    const email = new FormData(form).get('email');
    
    // Create a variable for a user-facing error message
    let errorMessage = null;

    try {
      const response = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the specific error from the backend, or a fallback
        throw new Error(data.error || 'Subscription failed. Please try again.');
      }

      alert('Thank you for subscribing! Please check your email to confirm.');
      form.reset();

    } catch (err) {
      alert(err.message); // Show the specific error in an alert
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Enoltra | Official Links</title>
  <meta name="description" content="Official links for Enoltra. New releases, free downloads, YouTube sets, and more." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@600;800&family=Dela+Gothic+One&display=swap" rel="stylesheet">
</svelte:head>

<div class="mobile-container">
  <img src="/linktree-planet.webp" alt="" class="deco-planet" />
  <img src="/linktree-chrome.webp" alt="" class="deco-chrome" />
  <img src="/linktree-rose.webp" alt="" class="deco-rose" />

  <header class="hero">
    <img src="/linktree-hero.webp" alt="Enoltra" class="hero-image" />
    <div class="hero-content">
      <img src="/logo.png" alt="Enoltra Logo" class="logo" />
      
      <div class="social-links">
        <a href="https://www.youtube.com/@Enoltra" target="_blank" rel="noopener noreferrer"><img src="/icon-youtube.svg" alt="YouTube"></a>
        <a href="https://www.tiktok.com/@enoltra.live" target="_blank" rel="noopener noreferrer"><img src="/icon-tiktok.svg" alt="TikTok"></a>
        <a href="https://www.instagram.com/enoltralive/" target="_blank" rel="noopener noreferrer"><img src="/icon-instagram.svg" alt="Instagram"></a>
        <a href="https://enoltralive.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><img src="/icon-bandcamp.svg" alt="Bandcamp"></a>
      </div>

      <nav class="anchor-nav">
        <a href="#youtube">YouTube</a>
        <a href="#downloads">Free Downloads</a>
        <a href="#newsletter">Newsletter</a>
      </nav>
    </div>
  </header>

  <main class="content-wrapper">
    <section class="link-section">
      <div class="link-card"><img src="/release-new-chapter.webp" alt="New Chapter" class="card-image"/> <div class="card-content"><h3>New Chapter (Coming soon!)</h3> <p>Enoltra</p> <a href="#newsletter" class="button-outline">Get Notified</a></div></div>
      <div class="link-card"><img src="/release3.webp" alt="M.I.A. Remix" class="card-image"/> <div class="card-content"><h3>M.I.A. (Enoltra Remix)</h3> <p>Enoltra</p> <a href="https://enoltralive.bandcamp.com/track/box-of-beats-mia-enoltra-remix" target="_blank" rel="noopener noreferrer" class="button-outline">Get on Bandcamp</a></div></div>
    </section>

    <section id="youtube" class="content-section">
      <h2>YouTube Sets</h2>
      <div class="embla" use:emblaCarouselSvelte={emblaOptions} on:emblaInit={onEmblaInit}>
        <div class="embla__container">
          <div class="embla__slide">
            <div class="video-wrapper">
              <iframe src="https://www.youtube.com/embed/NM4TvK4unjE?si=tvONa5w_HSH1baPV" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen={true}></iframe>
            </div>
          </div>
          <div class="embla__slide">
            <div class="video-wrapper">
              <iframe src="https://www.youtube.com/embed/LJC_k9ZuE9o?si=MPxjVMNtisC3-PFW" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen={true}></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="downloads" class="content-section">
      <h2>Free Downloads</h2>
      <div class="link-card">
        <img src="/release2.webp" alt="Bye Bye Bye Bootleg" class="card-image"/>
        <div class="card-content">
          <h3>Bye Bye Bye (Enoltra Bootleg)</h3>
          <p>N'Sync</p>
          <a href="/download-bye-bye-bye" class="button-outline">Free Download</a>
        </div>
      </div>
    </section>

    <section id="newsletter" class="content-section">
      <h2>Newsletter</h2>
      <div class="newsletter-box">
        <p>If you want to be the first to hear about new releases, freebies, tour dates, personal stories and special announcements, I would be super-happy to have you aboard 💜</p>
        
        <!-- UPDATED: This form is now correctly linked to your script -->
        <form class="newsletter-form" on:submit={handleNewsletterSubmit}>
          <input name="email" type="email" placeholder="enter your e-mail" required={true} disabled={isLoading} />
          <button type="submit" disabled={isLoading}>
            {#if isLoading}Subscribing...{:else}Be part of the tribe{/if}
          </button>
        </form>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p>© Designed by Enoltra</p>
  </footer>
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; }
  .mobile-container { max-width: 500px; margin: 0 auto; background-color: #2B2FC6; position: relative; display: flex; flex-direction: column; min-height: 100vh; }
  .content-wrapper { padding: 0 5%; flex-grow: 1; position: relative; z-index: 2; }
  .deco-planet, .deco-chrome, .deco-rose { position: absolute; pointer-events: none; }
  .deco-planet { top: 0; left: 0; width: 40%; z-index: 3; }
  .deco-chrome { top: 0; right: 0; width: 30%; z-index: 3; }
  .deco-rose { bottom: 0px; right: 0; width: 40%; z-index: 3; }
  .hero { position: relative; width: 100%; z-index: 1; }
  .hero-image { display: block; width: 100%; height: auto; }
  .hero-content { position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(180deg, rgba(43, 47, 198, 0) 0%, #2B2FC6 100%); padding-top: 60px; z-index: 2; }
  .logo { display: block; width: 75%; max-width: 280px; margin: 0 auto 12px auto; }
  .social-links { display: flex; justify-content: center; align-items: center; gap: 18px; margin-bottom: 18px; }
  .social-links img { height: 16px; transition: transform 0.2s; }
  .social-links a:hover img { transform: scale(1.1); }
  .anchor-nav { display: flex; justify-content: center; gap: 18px; padding-bottom: 12px; }
  .anchor-nav a { color: #C1FF72; text-decoration: none; font-family: 'Dela Gothic One', sans-serif; font-size: 0.75rem; font-weight: 400; }
  .link-section { margin-top: 28px; }
  .link-card { background-color: #A374F5; border-radius: 0; padding: 3%; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .card-image { width: 20%; height: 20%; object-fit: cover; border-radius: 0; flex-shrink: 0; }
  .card-content { width: 100%; display: flex; flex-direction: column; align-items: flex-start; height: 100%; }
  .card-content h3 { font-family: 'Dela Gothic One', sans-serif; font-weight: 400; font-size: 1.2rem; margin: 0; color: #fff; text-transform: none; }
  .card-content p { font-size: 1rem; margin: 4px 0 6px 0 ; color: rgba(255, 255, 255, 0.8); }
  .button-outline { display: inline-flex; align-items: center; justify-content: center; padding: 2px 16px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.8rem; background-color: transparent; color: #fff; border: 1px solid #fff; transition: all 0.2s; }
  .button-outline:hover { background-color: #fff; color: #A374F5; }
  .content-section { padding: 1.5rem 0; }
  .content-section h2 { font-size: 2rem; text-align: left; margin-bottom: 1rem; opacity: 0.4; text-transform: none; }
  .embla { overflow: hidden; margin: 0 -10px; }
  .embla__container { display: flex; }
  .embla__slide { position: relative; flex: 0 0 82%; padding: 0 10px; }
  .video-wrapper { position: relative; padding-top: 56.25%; height: 0; border-radius: 0; overflow: hidden; }
  .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
  .newsletter-box { background-color: #fff; border-radius: 0; padding: 20px; text-align: left; }
  .newsletter-box p { margin: 0 0 16px 0; line-height: 1.5; font-size: 0.9rem; color: #333; }
  .newsletter-form { display: flex; flex-direction: column; gap: 10px; }
  .newsletter-form input { width: 100%; padding: 10px 14px; border-radius: 999px; border: 1px solid #A374F5; font-size: 0.9rem; background: transparent; color: #333; }
  .newsletter-form input::placeholder { color: #A374F5; opacity: 0.7; }
  .newsletter-form button { padding: 10px 14px; border: 1px solid #000; border-radius: 999px; background: transparent; color: #000; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
  .newsletter-form button:hover { background-color: #000; color: #fff; }
  .site-footer { padding: 1rem 0; text-align: center; font-size: 0.8rem; position: relative; z-index: 5; margin-top: 1rem; }
  .site-footer p { color: #C1FF72; opacity: 0.8; }
</style>