// src/routes/+page.server.js

import { PRIVATE_EMAILOCTOPUS_API_KEY, PRIVATE_EMAILOCTOPUS_LIST_ID } from '$env/static/private';

export const actions = {
  // Using 'default' is simpler if there's only one form on the page.
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    if (!email) {
      return { success: false, error: 'Email is required.' };
    }

    // --- SUBSCRIBE TO EMAILOCTOPUS ---
    try {
      const apiData = {
        api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
        email_address: email,
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
        return { success: false, error: 'Could not subscribe. You may already be on the list.' };
      }

      return { success: true, message: "Thank you for subscribing!" };

    } catch (err) {
      console.error('EmailOctopus Server Error:', err);
      return { success: false, error: 'A server error occurred.' };
    }
  },
};