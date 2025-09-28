// src/routes/api/generate-download/+server.js

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';

import {
  PRIVATE_R2_ACCOUNT_ID,
  PRIVATE_R2_ACCESS_KEY_ID,
  PRIVATE_R2_SECRET_ACCESS_KEY,
  PRIVATE_R2_BUCKET_NAME,
  PRIVATE_EMAILOCTOPUS_API_KEY,
  PRIVATE_EMAILOCTOPUS_LIST_ID,
  PRIVATE_EMAIL_VALIDATION_API_KEY
} from '$env/static/private';

const fileName = 'NSYNC - Bye Bye Bye (Enoltra Bootleg).mp3';
const songTitle = 'Bye Bye Bye (Enoltra Bootleg)';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${PRIVATE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: PRIVATE_R2_ACCESS_KEY_ID,
    secretAccessKey: PRIVATE_R2_SECRET_ACCESS_KEY,
  },
});

export async function POST({ request }) {
  const { email } = await request.json();
  if (!email) { return json({ error: 'Email is required.' }, { status: 400 }); }

  try {
    const validationResponse = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`);
    const validationData = await validationResponse.json();
    if (validationData.deliverability !== 'DELIVERABLE') {
      return json({ error: 'Invalid e-mail. Please enter a valid e-mail.' }, { status: 400 });
    }
  } catch (err) {
    console.error('Email Validation API Error:', err);
    return json({ error: 'Could not verify email at this time.' }, { status: 500 });
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
      return json({ error: errorData.error?.message || 'Could not subscribe.' }, { status: 400 });
    }

    const newContact = await createResponse.json();
    const contactId = newContact.id;

    // --- STEP 2: GENERATE R2 LINK AND UPDATE THE CONTACT ---
    const command = new GetObjectCommand({ Bucket: PRIVATE_R2_BUCKET_NAME, Key: fileName });
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });
    
    const updateData = {
      api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
      fields: { DownloadLink: signedUrl, SongName: songTitle },
      tags: ["Download Gate"],
      status: 'PENDING'
    };
    
    await fetch(`https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    return json({ success: true });
  } catch (err) {
    console.error("Server Error:", err);
    return json({ error: 'A server error occurred.' }, { status: 500 });
  }
}