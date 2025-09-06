<script>
  import { slide, fade } from 'svelte/transition';

  // REMOVED: This block was unused and causing issues.
  // const emblaOptions = { ... };
let step = 1;
  let emailValue = '';
  let errorMessage = '';
  let isDownloading = false;

  const emailRegex = /\S+@\S+\.\S+/;

  function handleEmailSubmit(event) {
    event.preventDefault();
    if (emailRegex.test(emailValue)) {
      errorMessage = '';
      step = 2;
    } else {
      errorMessage = 'Please enter a valid email address.';
    }
  }

  function handleFollowClick(url) {
    window.open(url, '_blank');
    step = 3;
  }

  // UPDATED: This function now calls the new streaming endpoint
  async function triggerDownload() {
    if (isDownloading) return;
    isDownloading = true;

    try {
      // 1. Call the new backend API endpoint
      const response = await fetch('/api/download-track');

      if (!response.ok) {
        throw new Error('Failed to start download.');
      }

      // 2. Convert the response (the file stream) into a Blob
      const blob = await response.blob();
      
      // 3. Create a temporary, local URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // 4. Use the reliable <a> tag method to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = "N'SYNC - Bye Bye Bye (Enoltra Bootleg).wav"; // Set the desired filename
      document.body.appendChild(link);
      link.click();
      
      // 5. Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      alert('Sorry, the download could not be started. Please try again.');
    } finally {
      isDownloading = false;
    }
  }
</script>

<svelte:head>
  <title>Download: Bye Bye Bye (Enoltra Bootleg)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;700&family=Dela+Gothic+One&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

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
          <!-- UPDATED: Corrected the 'required' attribute -->
          <input type="email" placeholder="enter your e-mail" bind:value={emailValue} required={true} />
          <button type="submit">Done!</button>
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
          <button on:click={() => handleFollowClick('https://www.tiktok.com/@enoltra.live')}>TikTok</button>
        </div>
        <!-- This text is now correctly removed as per your previous request -->
      {/if}

      {#if step === 3}
        <div class="gate-box">
          <p class="card-text">Thank you so much for completing the steps!<br/>Here is your freebie 👇</p>
        </div>
        <div class="gate-form">
          <button on:click={triggerDownload}>Download Track</button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #2B2FC6;
  }

  .gate-container {
    width: 100%;
    min-height: 100vh;
    background-image: url('/bye-bye-bg.webp');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 28px;
    box-sizing: border-box;
  }

  .content-wrapper {
    width: 100%;
    max-width: 420px;
    height: 100%;
    max-height: 800px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .deco-shape-1, .deco-shape-2 {
    position: fixed;
    pointer-events: none;
    z-index: 2;
  }
  .deco-shape-1 {
    bottom: 0;
    left: 0;
    max-width: 45%; 
    height: auto;
  }
  .deco-shape-2 {
    top: 0;
    right: 0;
    max-width: 35%; 
    height: auto;
  }

  .gate-header {
    text-align: center;
    color: #fff;
  }
  .main-title {
    font-family: 'Dela Gothic One', sans-serif;
    font-size: 2.6rem;
    font-weight: 400;
    text-transform: none;
    margin-top: -1rem;
    margin-bottom: 2rem;
    line-height: 1.2;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .interactive-area {
      width: 100%;
  }

  .gate-box {
    background-color: rgba(163, 116, 245, 0.8);
    padding: 24px;
    width: 100%;
    text-align: center;
  }

  .card-text {
    color: #fff;
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 400;
    font-size: 2rem;
    line-height: 1;
    margin: 0;
  }

  .gate-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4rem;
    position: relative;
  }

  .gate-form input, .gate-form button {
    width: 100%;
    padding: 12px 16px;
    border-radius: 999px;
    font-size: 1.5rem;
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 600;
    background: transparent;
    color: #fff;
    border: 1px solid #fff;
    cursor: pointer;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .gate-form input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  .gate-form button:hover {
    background-color: #fff;
    color: #A374F5;
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