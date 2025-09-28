// src/routes/download-bye-bye-bye/+page.server.js

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
      const apiData = {
        api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
        email_address: email,
        tags: ["Download Gate"],
        status: "PENDING"
      };
      const response = await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return fail(400, { error: errorData.error?.message || 'Could not subscribe.' });
      }
      return { success: true };
    } catch (err) {
      return fail(500, { error: 'A server error occurred.' });
    }
  }
};