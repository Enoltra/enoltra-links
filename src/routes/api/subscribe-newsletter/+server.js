// src/routes/api/subscribe-newsletter/+server.js

import { json } from '@sveltejs/kit';
import {
  PRIVATE_EMAILOCTOPUS_API_KEY,
  PRIVATE_EMAILOCTOPUS_LIST_ID,
  PRIVATE_EMAIL_VALIDATION_API_KEY
} from '$env/static/private';

export async function POST({ request }) {
  const { email } = await request.json();
  if (!email) { return json({ error: 'Email is required.' }, { status: 400 }); }

  try {
    const validationResponse = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`
    );
    const validationData = await validationResponse.json();
    if (validationData.deliverability !== 'DELIVERABLE') {
      return json({ error: 'Invalid e-mail. Please enter a valid e-mail.' }, { status: 400 });
    }
  } catch (err) {
    console.error('Email Validation API Error:', err);
    return json({ error: 'Could not verify email at this time. Please try again later.' }, { status: 500 });
  }

  try {
    const apiData = {
      api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
      email_address: email,
      tags: ["Newsletter"],
      // UPDATED: This is the critical fix.
      status: "PENDING"
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
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'Could not subscribe. Please try again.';
      return json({ error: errorMessage }, { status: 400 });
    }

    return json({ success: true });

  } catch (err) {
    return json({ error: 'A server error occurred. Please try again later.' }, { status: 500 });
  }
}