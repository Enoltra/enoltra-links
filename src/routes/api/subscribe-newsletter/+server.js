// src/routes/api/subscribe-newsletter/+server.js

import { json } from '@sveltejs/kit';
import { PRIVATE_EMAILOCTOPUS_API_KEY, PRIVATE_EMAILOCTOPUS_LIST_ID } from '$env/static/private';

export async function POST({ request }) {
  const { email } = await request.json();
  if (!email) { return json({ error: 'Email is required.' }, { status: 400 }); }

  try {
    const apiData = {
      api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
      email_address: email,
      // This payload correctly has ONLY the "Newsletter" tag
      tags: ["Newsletter"],
      status: "SUBSCRIBED"
    };

    const response = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      }
    );

    if (!response.ok) {
      return json({ error: 'Could not subscribe. You may already be on the list.' }, { status: 400 });
    }

    return json({ success: true });

  } catch (err) {
    return json({ error: 'A server error occurred.' }, { status: 500 });
  }
}