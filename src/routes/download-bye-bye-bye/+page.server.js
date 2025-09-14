// src/routes/download-bye-bye-bye/+page.server.js

import {
  PRIVATE_EMAILOCTOPUS_API_KEY,
  PRIVATE_EMAILOCTOPUS_LIST_ID,
  PRIVATE_EMAIL_VALIDATION_API_KEY // You will need to add this to Vercel and .env
} from '$env/static/private';

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    // --- STEP 1: VERIFY THE EMAIL IS REAL (Optional but recommended) ---
    try {
      const validationResponse = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`
      );
      const validationData = await validationResponse.json();

      if (validationData.deliverability !== 'DELIVERABLE') {
        return { success: false, error: 'This email address does not appear to be valid.' };
      }
    } catch (err) {
      console.error('Email Validation API Error:', err);
      // If the service fails, you might choose to let the email through,
      // but for a download gate, it's often better to block it.
      return { success: false, error: 'Could not verify email at this time.' };
    }

    // --- STEP 2: SUBSCRIBE TO EMAILOCTOPUS ---
    try {
      const response = await fetch(
        `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
            email_address: email,
          }),
        }
      );

      if (!response.ok) {
        return { success: false, error: 'Could not subscribe. You may already be on the list.' };
      }

      // If everything worked, return a success message
      return { success: true };

    } catch (err) {
      console.error('EmailOctopus Server Error:', err);
      return { success: false, error: 'A server error occurred.' };
    }
  },
};