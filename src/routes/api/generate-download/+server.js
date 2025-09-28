// src/routes/api/generate-download/+server.js (Robust Error Handling Version)

import { json } from '@sveltejs/kit';
import { PRIVATE_EMAILOCTOPUS_API_KEY, PRIVATE_EMAILOCTOPUS_LIST_ID } from '$env/static/private';

export async function POST({ request }) {
  const { email } = await request.json();
  if (!email) { return json({ error: 'Email is required.' }, { status: 400 }); }

  const apiData = {
    api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
    email_address: email,
  };

  try {
    const response = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ADDED: A standard User-Agent header as a creative "just-in-case" fix
          'User-Agent': 'EnoltraWebsite/1.0',
        },
        body: JSON.stringify(apiData),
      }
    );

    // This is the new, robust error handling
    if (!response.ok) {
      // We will now read the error as plain text, which will never fail.
      const rawErrorText = await response.text();
      
      // This will now DEFINITIVELY show up in your Vercel logs.
      console.error('EmailOctopus Raw Error Response:', rawErrorText);
      
      // We will send this raw, useful error back to the user's screen.
      // It might say "API_KEY_INVALID" or something else specific.
      const errorMessage = rawErrorText || 'Could not subscribe. Please check the logs.';
      return json({ error: errorMessage }, { status: 400 });
    }

    // If it succeeds, we know the core connection is working.
    return json({ success: true });

  } catch (err) {
    // This catches network-level errors (e.g., Vercel can't reach the internet)
    console.error("Server Network Error:", err);
    return json({ error: 'A network error occurred. Please try again later.' }, { status: 500 });
  }
}