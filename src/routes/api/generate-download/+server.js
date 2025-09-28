// src/routes/api/generate-download/+server.js (Minimalist Test Version)

import { json } from '@sveltejs/kit';
import { PRIVATE_EMAILOCTOPUS_API_KEY, PRIVATE_EMAILOCTOPUS_LIST_ID } from '$env/static/private';

export async function POST({ request }) {
  const { email } = await request.json();
  if (!email) { return json({ error: 'Email is required.' }, { status: 400 }); }

  // This is the absolute minimum data required by the EmailOctopus API.
  // We have removed all other fields (tags, custom fields, status) for this test.
  const apiData = {
    api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
    email_address: email,
  };

  try {
    const response = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      }
    );

    // If this call fails, we will now get the REAL error message from the API.
    if (!response.ok) {
      const errorData = await response.json();
      // This will show the true error in your Vercel logs and on the frontend.
      console.error('EmailOctopus Minimalist API Error:', errorData); 
      const errorMessage = errorData.error?.message || 'A new error occurred. Please check the logs.';
      return json({ error: errorMessage }, { status: 400 });
    }

    // If it succeeds, we know the core connection is working.
    return json({ success: true });

  } catch (err) {
    console.error("Server Error:", err);
    return json({ error: 'A server-level error occurred. Please check the Vercel logs.' }, { status: 500 });
  }
}