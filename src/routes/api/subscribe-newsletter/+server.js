// src/routes/api/subscribe-newsletter/+server.js (Final Version with Validation)

import { json } from '@sveltejs/kit';
import {
  PRIVATE_EMAILOCTOPUS_API_KEY,
  PRIVATE_EMAILOCTOPUS_LIST_ID,
  PRIVATE_EMAIL_VALIDATION_API_KEY
} from '$env/static/private';

export async function POST({ request }) {
  const { email } = await request.json();
  if (!email) { return json({ error: 'Email is required.' }, { status: 400 }); }

  // --- STEP 1: VERIFY THE EMAIL WITH ABSTRACT API ---
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
    return json({ error: 'Could not verify email at this time.' }, { status: 500 });
  }

  // --- STEP 2: CREATE A PENDING CONTACT IN EMAILOCTOPUS ---
  try {
    const apiData = {
      api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
      email_address: email,
      tags: ["Newsletter"],
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
      const errorMessage = errorData.error?.message || 'Could not subscribe.';
      return json({ error: errorMessage }, { status: 400 });
    }

    return json({ success: true });

  } catch (err) {
    console.error("Server Error:", err);
    return json({ error: 'A server error occurred.' }, { status: 500 });
  }
}