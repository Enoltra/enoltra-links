// src/routes/download-bye-bye-bye/+page.server.js

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
      // --- STEP 1: CREATE THE CONTACT WITH MINIMAL DATA ---
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

      // --- STEP 2: GENERATE R2 LINK AND UPDATE THE CONTACT ---
      const command = new GetObjectCommand({ Bucket: PRIVATE_R2_BUCKET_NAME, Key: 'NSYNC - Bye Bye Bye (Enoltra Bootleg).mp3' });
      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });
      
      const updateData = {
        api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
        fields: { DownloadLink: signedUrl, SongName: 'Bye Bye Bye (Enoltra Bootleg)' },
        tags: ["Download Gate"],
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