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
      // STEP 1: Generate signed R2 URL first
      const command = new GetObjectCommand({
        Bucket: PRIVATE_R2_BUCKET_NAME,
        Key: 'NSYNC - Bye Bye Bye (Enoltra Bootleg).mp3'
      });
      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });

      // STEP 2: Try to create contact with fields already included
      let contactId;
      const createResponse = await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
          email_address: email,
          fields: {
            DownloadLinkNSYNC: signedUrl,
            SongName: 'Bye Bye Bye (Enoltra Bootleg)'
          },
          status: 'SUBSCRIBED'
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
          if (!existing) return fail(500, { error: 'Could not retrieve your subscription.' });
          contactId = existing.id;

          await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${contactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
            fields: {
  'Download Link': signedUrl,
  'Song Name': 'Bye Bye Bye (Enoltra Bootleg)'
},
              status: 'SUBSCRIBED'
            }),
          });
        } else {
          return fail(400, { error: errorData.error?.message || 'Could not subscribe.' });
        }
      }

      return { success: true };
    } catch (err) {
      return fail(500, { error: 'A server error occurred.' });
    }
  }
};
