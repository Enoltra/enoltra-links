// src/routes/+page.server.js (With Validation)

import { PRIVATE_EMAILOCTOPUS_API_KEY, PRIVATE_EMAILOCTOPUS_LIST_ID, PRIVATE_EMAIL_VALIDATION_API_KEY } from '$env/static/private';

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    if (!email) {
      return { success: false, error: 'Email is required.' };
    }

    // --- STEP 1: VERIFY THE EMAIL WITH ABSTRACT API ---
    try {
      const validationResponse = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`
      );
      const validationData = await validationResponse.json();

      // Check if the email is deliverable. This is the key validation step.
      if (validationData.deliverability !== 'DELIVERABLE') {
        return { success: false, error: 'This email address does not appear to be valid.' };
      }
    } catch (err) {
      console.error('Email Validation API Error:', err);
      // Fail-safe: If the validation service is down, we'll still let the user subscribe.
    }

    // --- STEP 2: SUBSCRIBE TO EMAILOCTOPUS ---
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