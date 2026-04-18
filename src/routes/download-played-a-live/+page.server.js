import { fail } from '@sveltejs/kit';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

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

      // EmailOctopus uses MD5 hash of lowercased email as contact ID
      const emailHash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');

      // STEP 1: Try to create the contact
      const createData = { api_key: PRIVATE_EMAILOCTOPUS_API_KEY, email_address: email };
      const createResponse = await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });

      if (createResponse.ok) {
        const newContact = await createResponse.json();
        contactId = newContact.id;
      } else {
        const errorData = await createResponse.json();
        if (errorData.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
          // Use MD5 hash as the contact ID for existing contacts
          contactId = emailHash;
        } else {
          return fail(400, { error: errorData.error?.message || 'Could not subscribe.' });
        }
      }

      // STEP 2: Generate signed R2 URL and update contact
      const command = new GetObjectCommand({
        Bucket: PRIVATE_R2_BUCKET_NAME,
        Key: 'Safri Duo - Played-A-Live (Enoltra Bootleg).mp3'
      });
      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });

      const updateData = {
        api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
        fields: { DownloadLink: signedUrl, SongName: 'Played-A-Live (Enoltra Bootleg)' },
        tags: ["Download-Played-A-Live"],
        status: 'PENDING'
      };

      await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      return { success: true };
    } catch (err) {
      return fail(500, { error: 'A server error occurred.' });
    }
  }
};
