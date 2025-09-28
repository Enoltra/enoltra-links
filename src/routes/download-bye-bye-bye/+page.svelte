<script>
  import { slide, fade } from 'svelte/transition';

  let step = 1;
  let emailValue = '';
  let errorMessage = '';
  let isLoading = false;

  const emailRegex = /\S+@\S+\.\S+/;

  async function handleEmailSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    if (!emailRegex.test(emailValue)) {
      errorMessage = 'Please enter a valid email address.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch('/api/generate-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred.');
      }
      step = 2; // Move to the follow step on success
    } catch (err) {
      errorMessage = err.message;
    } finally {
      isLoading = false;
    }
  }

  function handleFollowClick(url) {
    window.open(url, '_blank');
    step = 3; // Move to the final download step
  }

  function triggerDownload() {
    // This is a placeholder for the email automation
    // For now, it just shows a final confirmation.
    alert('Success! In the final version, the download would be sent to your email.');
  }
</script>

<svelte:head>
  <title>Download: Bye Bye Bye (Enoltra Bootleg)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;700&family=Dela+Gothic+One&display=swap" rel="stylesheet">
</svelte:head>

<!-- This is the plain blue background for the entire page viewport -->
<div class="page-background">
  <!-- This is the centered "phone screen" frame -->
  <div class="gate-container">
    <img src="/chrome-shape-1-dl-gate.webp" alt="" class="deco-shape-1" />
    <img src="/chrome-shape-2-dl-gate.webp" alt="" class="deco-shape-2" />

    <div class="content-wrapper">
      <header class="gate-header">
        <h1 class="main-title">Bye Bye Bye (Enoltra Bootleg)</h1>
      </header>

      <div class="interactive-area">
        {#if step === 1}
          <div class="gate-box">
            <p class="card-text">Please enter your e-mail to be able to receive all future free drops directly to your inbox :)</p>
          </div>
          <form class="gate-form" on:submit={handleEmailSubmit}>
            <input type="email" placeholder="enter your e-mail" bind:value={emailValue} required disabled={isLoading} />
            <button type="submit" disabled={isLoading}>
              {#if isLoading}Submitting...{:else}Done!{/if}
            </button>
            {#if errorMessage}
              <div class="error-popup" in:slide={{ duration: 300 }} out:fade={{ duration: 200 }}>
                {errorMessage}
              </div>
            {/if}
          </form>
        {/if}

        {#if step === 2}
          <div class="gate-box">
            <p class="card-text">To download this track, please select one channel to follow Enoltra on:</p>
          </div>
          <div class="gate-form">
            <button on:click={() => handleFollowClick('https://instagram.com/enoltralive')}>Instagram</button>
            <button on:click={() => handleFollowClick('https://youtube.com/@enoltra')}>YouTube</button>
            <button on:click={() => handleFollowClick('https://www.tiktok.com/@enoltralive')}>TikTok</button>
          </div>
          <p class="card-footer-text">To Download &rarr;</p>
        {/if}

        {#if step === 3}
          <div class="gate-box">
            <p class="card-text">Success! ✅<br/>Please check your inbox to confirm and get your download.</p>
          </div>
          <div class="gate-form">
            <a href="/" class="button-link">Back to Home</a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .page-background {
    background-color: #2B2FC6;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  }

  .gate-container {
    width: 100%;
    max-width: 420px;
    height: 844px;
    max-height: 95vh;
    aspect-ratio: 9 / 19.5;
    background-image: url('/bye-bye-bg.webp');
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .content-wrapper {
    width: 100%;
    padding: 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    flex-grow: 1;
  }

  .deco-shape-1, .deco-shape-2 {
    position: absolute;
    pointer-events: none;
    z-index: 2;
  }
  .deco-shape-1 {
    bottom: 0;
    left: 0;
    width: 180px;
    transform: translate(-25%, 25%);
  }
  .deco-shape-2 {
    top: 0;
    right: 0;
    width: 160px;
    transform: translate(25%, -25%);
  }

  .gate-header {
    text-align: center;
    color: #fff;
  }
  .main-title {
    font-family: 'Dela Gothic One', sans-serif;
    font-size: 1.9rem;
    font-weight: 400;
    text-transform: none;
    margin: 0;
    line-height: 1.2;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  }

  .interactive-area {
    width: 100%;
  }

  .gate-box {
    background-color: rgba(163, 116, 245, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 24px;
    width: 100%;
    text-align: center;
  }

  .card-text {
    color: #fff;
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 400;
    font-size: 1.2rem;
    line-height: 1.4;
    margin: 0;
  }

  .gate-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 1.5rem;
    position: relative;
  }

  .gate-form input, .gate-form button, .button-link {
    width: 100%;
    padding: 12px 16px;
    border-radius: 999px;
    font-size: 1rem;
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 600;
    background: transparent;
    color: #fff;
    border: 1px solid #fff;
    cursor: pointer;
    transition: all 0.2s;
    box-sizing: border-box;
    text-align: center;
    text-decoration: none;
  }
  
  .gate-form input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  .gate-form button:hover, .button-link:hover {
    background-color: #fff;
    color: #A374F5;
  }

  .gate-form button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .card-footer-text {
    color: #fff;
    font-family: 'Dela Gothic One', sans-serif;
    font-size: 1rem;
    margin: 1.5rem 0 0 0;
    text-align: right;
    padding-right: 10px;
  }

  .error-popup {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 12px;
    background-color: #fff;
    color: #d9534f;
    padding: 10px 15px;
    border-radius: 8px;
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    z-index: 10;
  }

  .error-popup::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent white transparent;
  }
</style>