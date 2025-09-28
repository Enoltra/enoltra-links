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
    // UPDATED: This now correctly stops execution if the validation service fails.
    return json({ error: 'Could not verify email at this time. Please try again later.' }, { status: 500 });
  }

  try {
    const command = new GetObjectCommand({ Bucket: PRIVATE_R2_BUCKET_NAME, Key: fileName });
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });

    const apiData = {
      api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
      email_address: email,
      fields: { DownloadLink: signedUrl, SongName: songTitle },
      tags: ["Download Gate"],
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
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'Could not subscribe. Please try again.';
      return json({ error: errorMessage }, { status: 400 });
    }

    return json({ success: true });

  } catch (err) {
    console.error("Server Error:", err);
    return json({ error: 'A server error occurred. Please try again later.' }, { status: 500 });
  }
}