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
    const validationResponse = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`);
    const validationData = await validationResponse.json();
    if (validationData.deliverability !== 'DELIVERABLE') {
      return json({ error: 'Invalid e-mail. Please enter a valid e-mail.' }, { status: 400 });
    }
  } catch (err) {
    console.error('Email Validation API Error:', err);
    return json({ error: 'Could not verify email at this time.' }, { status: 500 });
  }

  try {
    // --- STEP 1: CREATE THE CONTACT WITH MINIMAL DATA ---
    const createData = { api_key: PRIVATE_EMAILOCTOPUS_API_KEY, email_address: email };
    const createResponse = await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      return json({ error: errorData.error?.message || 'Could not subscribe.' }, { status: 400 });
    }

    const newContact = await createResponse.json();
    const contactId = newContact.id;
    
    // --- STEP 2: UPDATE THE CONTACT WITH TAGS ---
    const updateData = { api_key: PRIVATE_EMAILOCTOPUS_API_KEY, tags: ["Newsletter"], status: 'PENDING' };
    
    await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    
    return json({ success: true });

  } catch (err) {
    console.error("Server Error:", err);
    return json({ error: 'A server error occurred.' }, { status: 500 });
  }
}