<script>
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  
  let emblaApi;
  let isLoading = false;

  const emblaOptions = {
    loop: false,
    draggable: true,
    dragFree: false
  };

  function onEmblaInit(event) {
    emblaApi = event.detail;
  }

  function scrollPrev() {
    if (emblaApi) {
      if (!emblaApi.canScrollPrev()) {
        emblaApi.scrollTo(emblaApi.scrollSnapList().length - 1);
      } else {
        emblaApi.scrollPrev();
      }
    }
  }

  function scrollNext() {
    if (emblaApi) {
      if (!emblaApi.canScrollNext()) {
        emblaApi.scrollTo(0);
      } else {
        emblaApi.scrollNext();
      }
    }
  }

  async function handleNewsletterSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    isLoading = true;
    const form = event.target;
    const email = new FormData(form).get('email');
    try {
      fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      alert('Thank you for subscribing! Please check your email to confirm.');
      form.reset();
    } catch (err) {
      alert('A network error occurred. Please check your connection.');
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
        <a href="https://soundcloud.com/enoltralive" target="_blank" rel="noopener noreferrer"><img src="/sc-icon.svg" alt="SoundCloud"></a>
        <a href="https://enoltralive.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><img src="/icon-bandcamp.svg" alt="Bandcamp"></a>
      </div>

      <div class="anchor-nav-wrapper">
        <nav class="anchor-nav">
          <a href="#downloads">Free Downloads</a>
          <a href="#releases">Releases</a>
          <a href="#youtube">YouTube</a>
          <a href="#collectives">Collectives</a>
          <a href="#newsletter">Newsletter</a>
          <a href="https://www.figma.com/proto/GPUYzijAWnOQiZq1ybTX9U/Enoltra-EPK?node-id=2843-3&t=fuvzTvd5wLEhd2nj-1" target="_blank" rel="noopener noreferrer">EPK</a>
        </nav>
        <div class="anchor-nav-fade anchor-nav-fade--left"></div>
        <div class="anchor-nav-fade anchor-nav-fade--right"></div>
      </div>
    </div>
  </header>

  <main class="content-wrapper">

    <!-- ========= FREE DOWNLOADS ========= -->
    <section id="downloads" class="content-section" style="padding-top: 0.5rem;">
      <h2>Free Downloads</h2>
      <div class="link-card">
        <img src="/release2.webp" alt="Bye Bye Bye Bootleg" class="card-image"/>
        <div class="card-content">
          <h3>Bye Bye Bye (Enoltra Bootleg)</h3>
          <p>N'Sync</p>
          <div class="card-actions">
            <a href="https://soundcloud.com/enoltralive/nsync-bye-bye-bye-enoltra-bootleg-free-dl" target="_blank" rel="noopener noreferrer" class="button-outline">Listen</a>
            <a href="/download-bye-bye-bye" class="button-outline">Free Download</a>
          </div>
        </div>
      </div>
      <div class="link-card">
        <img src="/Drum-a-Lot Cover art.webp" alt="Played-A-Live Bootleg" class="card-image"/>
        <div class="card-content">
          <h3>Played-A-Live (Enoltra Bootleg)</h3>
          <p>Safri Duo</p>
          <a href="/download-played-a-live" class="button-outline">Free Download</a>
        </div>
      </div>
    </section>

    <!-- ========= RELEASES ========= -->
    <section id="releases" class="content-section">
      <h2>Releases</h2>
      <div class="link-card">
        <img src="/release-new-chapter.webp" alt="New Chapter" class="card-image"/>
        <div class="card-content">
          <h3>New Chapter (Coming soon!)</h3>
          <p>Enoltra</p>
          <a href="#newsletter" class="button-outline">Get Notified</a>
        </div>
      </div>
      <div class="link-card">
        <img src="/release3.webp" alt="M.I.A. Remix" class="card-image"/>
        <div class="card-content">
          <h3>M.I.A. (Enoltra Remix)</h3>
          <p>Enoltra</p>
          <a href="https://enoltralive.bandcamp.com/track/box-of-beats-mia-enoltra-remix" target="_blank" rel="noopener noreferrer" class="button-outline">Get on Bandcamp</a>
        </div>
      </div>
    </section>

    <!-- ========= YOUTUBE SETS ========= -->
    <section id="youtube" class="content-section">
      <h2>YouTube Sets</h2>
      <div class="carousel-wrapper">
        <button class="carousel-nav-btn" on:click={scrollPrev} aria-label="Previous video" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
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
        <button class="carousel-nav-btn" on:click={scrollNext} aria-label="Next video" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>

    <!-- ========= COLLECTIVES ========= -->
    <section id="collectives" class="content-section">
      <h2>Collectives</h2>
      <div class="link-card">
        <img src="/fader_f_icon.webp" alt="Fader Friends" class="card-image"/>
        <div class="card-content">
          <h3>Fader Friends</h3>
          <p>Fostering a wide range of electronic genres</p>
          <a href="https://www.instagram.com/fader_friends/" target="_blank" rel="noopener noreferrer" class="button-outline">Follow</a>
        </div>
      </div>
      <div class="link-card">
        <img src="/birdhouse_icon.webp" alt="BirdHouse" class="card-image"/>
        <div class="card-content">
          <h3>BirdHouse</h3>
          <p>Quickly-growing Viennese house, progressive & trance collective</p>
          <a href="https://www.instagram.com/kollektiv_birdhouse/" target="_blank" rel="noopener noreferrer" class="button-outline">Follow</a>
        </div>
      </div>
    </section>

    <!-- ========= EPK ========= -->
    <section class="content-section">
      <div class="epk-card">
        <div class="epk-text">
          <h3>Electronic Press Kit</h3>
          <p>Artist bio, sets, music catalogue & everything a booker needs</p>
        </div>
        <a href="https://www.figma.com/proto/GPUYzijAWnOQiZq1ybTX9U/Enoltra-EPK?node-id=2843-3&t=fuvzTvd5wLEhd2nj-1" target="_blank" rel="noopener noreferrer" class="button-outline">View EPK</a>
      </div>
    </section>

    <!-- ========= NEWSLETTER ========= -->
    <section id="newsletter" class="content-section">
      <h2>Newsletter</h2>
      <div class="newsletter-box">
        <p>If you want to be the first to hear about new releases, freebies, tour dates, personal stories and special announcements, I would be super-happy to have you aboard 💜</p>
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
  :global(html, body) { margin: 0; padding: 0; background-color: #2B2FC6; }

  .mobile-container {
    max-width: 500px;
    margin: 0 auto;
    background-color: #2B2FC6;
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
  .content-wrapper { padding: 0 5%; flex-grow: 1; position: relative; z-index: 2; }

  .deco-planet, .deco-chrome, .deco-rose { position: absolute; pointer-events: none; }
  .deco-planet { top: 0; left: 0; width: 40%; z-index: 3; }
  .deco-chrome { top: 0; right: 0; width: 30%; z-index: 3; }
  .deco-rose { bottom: 0; right: 0; width: 40%; z-index: 3; }

  .hero { position: relative; width: 100%; z-index: 1; }
  .hero-image {
    display: block;
    width: 100%;
    height: auto;
    margin-top: calc(-1 * env(safe-area-inset-top, 0px));
    padding-top: env(safe-area-inset-top, 0px);
  }
  .hero-content {
    position: absolute;
    bottom: 0; left: 0;
    width: 100%;
    background: linear-gradient(180deg, rgba(43, 47, 198, 0) 0%, #2B2FC6 100%);
    padding-top: 60px;
    z-index: 2;
  }
  .logo { display: block; width: 75%; max-width: 280px; margin: 0 auto 12px auto; }

  /* Social icons */
  .social-links { display: flex; justify-content: center; align-items: center; gap: 18px; margin-bottom: 18px; }
  .social-links a { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; flex-shrink: 0; }
  /* TikTok (2nd) & Instagram (3rd): 22 x0.9 x0.9 = 18px */
  .social-links img { width: 18px; height: 18px; object-fit: contain; transition: transform 0.2s; }
  /* YouTube (1st): 25 x0.9 = 23px */
  .social-links a:nth-child(1) img { width: 23px; height: 23px; }
  /* SoundCloud (4th): 30 x0.9 = 27px */
  .social-links a:nth-child(4) img { width: 27px; height: 27px; }
  /* Bandcamp (5th): 31 x0.9 = 28px */
  .social-links a:nth-child(5) img { width: 28px; height: 28px; }
  .social-links a:hover img { transform: scale(1.1); }

  /* Anchor nav */
  .anchor-nav-wrapper { position: relative; overflow: hidden; padding-bottom: 12px; }
  .anchor-nav { display: flex; gap: 20px; padding-left: 5%; padding-right: 100px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; white-space: nowrap; flex-wrap: nowrap; }
  .anchor-nav::-webkit-scrollbar { display: none; }
  .anchor-nav a { color: #C1FF72; text-decoration: none; font-family: 'Dela Gothic One', sans-serif; font-size: 0.8rem; font-weight: 400; flex-shrink: 0; }
  .anchor-nav-fade { position: absolute; top: 0; height: 100%; pointer-events: none; }
  .anchor-nav-fade--left { left: 0; width: 40px; background: linear-gradient(to left, rgba(43, 47, 198, 0) 0%, #2B2FC6 70%); }
  .anchor-nav-fade--right { right: 0; width: 100px; background: linear-gradient(to right, rgba(43, 47, 198, 0) 0%, #2B2FC6 70%); }

  /* Cards */
  .link-card { background-color: #A374F5; padding: 3%; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .card-image { width: 64px; height: 64px; object-fit: cover; flex-shrink: 0; }
  .card-content { flex: 1; display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
  .card-content h3 { font-family: 'Dela Gothic One', sans-serif; font-weight: 400; font-size: 0.95rem; margin: 0; color: #fff; text-transform: none; line-height: 1.2; }
  .card-content p { font-size: 0.8rem; margin: 3px 0 6px 0; color: rgba(255, 255, 255, 0.8); line-height: 1.3; }

  .card-actions { display: flex; gap: 6px; flex-wrap: wrap; }

  .button-outline { display: inline-flex; align-items: center; justify-content: center; padding: 2px 14px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 0.75rem; background-color: transparent; color: #fff; border: 1px solid #fff; transition: all 0.2s; white-space: nowrap; }
  .button-outline:hover { background-color: #fff; color: #A374F5; }

  .content-section { padding: 0.75rem 0; }
  .content-section h2 { font-size: 2rem; text-align: left; margin-bottom: 1rem; opacity: 0.4; color: #fff; text-transform: none; font-family: 'Dela Gothic One', sans-serif; font-weight: 400; }

  .epk-card { background-color: #A374F5; padding: 4%; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .epk-text h3 { font-family: 'Dela Gothic One', sans-serif; font-weight: 400; font-size: 0.95rem; margin: 0; color: #fff; text-transform: none; }
  .epk-text p { font-size: 0.8rem; margin: 4px 0 0 0; color: rgba(255, 255, 255, 0.8); line-height: 1.3; }

  /* Carousel */
  .carousel-wrapper { position: relative; display: flex; align-items: center; gap: 8px; }
  .carousel-nav-btn { flex-shrink: 0; width: 24px; height: 36px; background: none; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.2s; z-index: 20; }
  .carousel-nav-btn:hover { opacity: 0.6; }
  .carousel-nav-btn:active { opacity: 0.4; }
  .carousel-nav-btn svg { width: 18px; height: 18px; color: #fff; }
  .embla { overflow: hidden; flex: 1; }
  .embla__container { display: flex; cursor: grab; user-select: none; }
  .embla__container:active { cursor: grabbing; }
  .embla__slide { position: relative; flex: 0 0 100%; min-width: 0; }
  .video-wrapper { position: relative; padding-top: 56.25%; height: 0; border-radius: 8px; overflow: hidden; }
  .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }

  /* Newsletter */
  .newsletter-box { background-color: #fff; padding: 20px; text-align: left; }
  .newsletter-box p { margin: 0 0 16px 0; line-height: 1.5; font-size: 0.9rem; color: #333; }
  .newsletter-form { display: flex; flex-direction: column; gap: 10px; }
  .newsletter-form input { width: 100%; padding: 10px 14px; border-radius: 999px; border: 1px solid #A374F5; font-size: 0.9rem; background: transparent; color: #333; }
  .newsletter-form input::placeholder { color: #A374F5; opacity: 0.7; }
  .newsletter-form button { padding: 10px 14px; border: 1px solid #000; border-radius: 999px; background: transparent; color: #000; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
  .newsletter-form button:hover { background-color: #000; color: #fff; }

  .site-footer { padding: 1rem 0; text-align: center; font-size: 0.8rem; position: relative; z-index: 5; margin-top: 1rem; }
  .site-footer p { color: #C1FF72; opacity: 0.8; }
</style>
