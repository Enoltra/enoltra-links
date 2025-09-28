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

const fileName = "N'SYNC - Bye Bye Bye (Enoltra Bootleg).wav";
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
    const validationResponse = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`
    );
    const validationData = await validationResponse.json();
    if (validationData.deliverability !== 'DELIVERABLE') {
      return json({ error: 'Invalid e-mail. Please enter a valid e-mail.' }, { status: 400 });
    }
  } catch (err) {
    console.error('Email Validation API Error:', err);
    return json({ error: 'Could not verify email at this time. Please try again later.' }, { status: 500 });
  }

  try {
    // --- STEP 1: CREATE THE CONTACT WITH MINIMAL DATA ---
    const createData = {
      api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
      email_address: email,
      tags: ["Download Gate"],
      status: "SUBSCRIBED"
    };

    const createResponse = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      const errorMessage = errorData.error?.message || 'Could not subscribe. Please try again.';
      return json({ error: errorMessage }, { status: 400 });
    }

    // --- STEP 2: GENERATE R2 LINK AND UPDATE THE CONTACT ---
    const command = new GetObjectCommand({ Bucket: PRIVATE_R2_BUCKET_NAME, Key: fileName });
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });

    const newContact = await createResponse.json();
    const contactId = newContact.id; // Get the ID of the contact we just created

    const updateData = {
      api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
      fields: {
        DownloadLink: signedUrl,
        SongName: songTitle
      }
    };

    // This makes a second API call to UPDATE the contact with the new fields
    await fetch(
      `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${contactId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      }
    );

    // Even if the update fails, the user is subscribed, so we return success.
    return json({ success: true });

  } catch (err) {
    console.error("Server Error:", err);
    return json({ error: 'A server error occurred. Please try again later.' }, { status: 500 });
  }
}