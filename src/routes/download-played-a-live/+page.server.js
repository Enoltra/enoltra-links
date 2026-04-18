import { fail } from '@sveltejs/kit';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  PRIVATE_R2_ACCOUNT_ID,
  PRIVATE_R2_ACCESS_KEY_ID,
  PRIVATE_R2_SECRET_ACCESS_KEY,
  PRIVATE_R2_BUCKET_NAME,
  PRIVATE_EMAILOCTOPUS_API_KEY,
  PRIVATE_EMAILOCTOPUS_LIST_ID,
  PRIVATE_EMAIL_VALIDATION_API_KEY
} from '$env/static/private';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${PRIVATE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: PRIVATE_R2_ACCESS_KEY_ID,
    secretAccessKey: PRIVATE_R2_SECRET_ACCESS_KEY,
  },
});

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
      let contactId;

      // STEP 1: Try to create the contact
      const createResponse = await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
          email_address: email
        }),
      });

      if (createResponse.ok) {
        const newContact = await createResponse.json();
        contactId = newContact.id;
      } else {
        const errorData = await createResponse.json();
        if (errorData.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
          const searchResponse = await fetch(
            `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts?api_key=${PRIVATE_EMAILOCTOPUS_API_KEY}&limit=100`
          );
          const searchData = await searchResponse.json();
          const existing = searchData.data?.find(c => c.email_address.toLowerCase() === email.toLowerCase());
          if (!existing) {
            return fail(500, { error: 'Could not retrieve your subscription.' });
          }
          contactId = existing.id;
        } else {
          return fail(400, { error: errorData.error?.message || 'Could not subscribe.' });
        }
      }

      // STEP 2: Generate signed R2 URL
      const command = new GetObjectCommand({
        Bucket: PRIVATE_R2_BUCKET_NAME,
        Key: 'Safri Duo - Played-A-Live (Enoltra Bootleg).mp3'
      });
      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });

      // STEP 3: Update contact with download link and tag
      await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
          fields: {
            DownloadLinkNSYNC: signedUrl,
            SongName: 'Played-A-Live (Enoltra Bootleg)'
          },
          tags: ['Download-Played-A-Live'],
          status: 'SUBSCRIBED'
        }),
      });

      return { success: true };
    } catch (err) {
      return fail(500, { error: 'A server error occurred.' });
    }
  }
};
