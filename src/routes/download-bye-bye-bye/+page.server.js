import { fail } from '@sveltejs/kit';
import {
  PRIVATE_EMAILOCTOPUS_API_KEY,
  PRIVATE_EMAILOCTOPUS_LIST_ID,
  PRIVATE_EMAIL_VALIDATION_API_KEY
} from '$env/static/private';

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    if (!email) return fail(400, { error: 'Email is required.' });

    try {
      const validationResponse = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`);
      const validationData = await validationResponse.json();
      if (validationData.deliverability !== 'DELIVERABLE') {
        return fail(400, { error: 'Invalid e-mail. Please enter a valid e-mail.' });
      }
    } catch (err) {
      return fail(500, { error: 'Could not verify email at this time.' });
    }

    const downloadUrl = 'https://downloads.enoltra.com/NSYNC%20-%20Bye%20Bye%20Bye%20(Enoltra%20Bootleg).wav';

    try {
      const createResponse = await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
          email_address: email,
          fields: {
            DownloadLinkNSYNC: downloadUrl,
            SongName: 'Bye Bye Bye (Enoltra Bootleg)'
          },
          status: 'SUBSCRIBED'
        }),
      });

      if (createResponse.ok) return { success: true };

      const errorData = await createResponse.json();

      if (errorData.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
        const searchResponse = await fetch(
          `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts?api_key=${PRIVATE_EMAILOCTOPUS_API_KEY}&limit=100`
        );
        const searchData = await searchResponse.json();
        const existing = searchData.data?.find(c => c.email_address.toLowerCase() === email.toLowerCase());
        if (!existing) return fail(500, { error: 'Could not retrieve your subscription.' });

        await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
            fields: {
              DownloadLinkNSYNC: downloadUrl,
              SongName: 'Bye Bye Bye (Enoltra Bootleg)'
            },
            status: 'SUBSCRIBED'
          }),
        });

        return { success: true };
      }

      return fail(400, { error: errorData.error?.message || 'Could not subscribe.' });

    } catch (err) {
      return fail(500, { error: 'A server error occurred.' });
    }
  }
};
