// src/routes/+page.server.js

import { fail } from '@sveltejs/kit';
import { PRIVATE_EMAILOCTOPUS_API_KEY, PRIVATE_EMAILOCTOPUS_LIST_ID, PRIVATE_EMAIL_VALIDATION_API_KEY } from '$env/static/private';

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    if (!email) { return fail(400, { error: 'Email is required.' }); }

    try {
      const validationResponse = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`);
      const validationData = await validationResponse.json();
      if (validationData.deliverability !== 'DELIVERABLE') {
        return fail(400, { error: 'Invalid e-mail. Please enter a valid e-mail.' });
      }
    } catch (err) {
      return fail(500, { error: 'Could not verify email at this time.' });
    }

    try {
      // --- STEP 1: CREATE THE CONTACT ---
      const createData = { api_key: PRIVATE_EMAILOCTOPUS_API_KEY, email_address: email };
      const createResponse = await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        return fail(400, { error: errorData.error?.message || 'Could not subscribe.' });
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
      
      return { success: true, message: "Thank you for subscribing! Please check your email to confirm." };
    } catch (err) {
      return fail(500, { error: 'A server error occurred.' });
    }
  }
};