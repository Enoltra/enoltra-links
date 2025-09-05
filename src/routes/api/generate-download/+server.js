// src/routes/api/generate-download/+server.js

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';

// Import your secret credentials from .env and Vercel
import {
  PRIVATE_R2_ACCOUNT_ID,
  PRIVATE_R2_ACCESS_KEY_ID,
  PRIVATE_R2_SECRET_ACCESS_KEY,
  PRIVATE_R2_BUCKET_NAME
} from '$env/static/private';

// The specific filename in your R2 bucket
const fileName = 'NSYNC - Bye Bye Bye (Enoltra Bootleg).mp3';

// Create the S3 client configured for Cloudflare R2
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${PRIVATE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: PRIVATE_R2_ACCESS_KEY_ID,
    secretAccessKey: PRIVATE_R2_SECRET_ACCESS_KEY,
  },
});

// This is the function that runs when your frontend calls this API endpoint
export async function GET() {
  try {
    const command = new GetObjectCommand({
      Bucket: PRIVATE_R2_BUCKET_NAME,
      Key: fileName,
    });

    // Generate the secret, short-lived URL (expires in 60 seconds)
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 60 });

    // Send the secret URL back to the browser
    return json({ url: signedUrl });

  } catch (err) {
    console.error("Error generating signed URL:", err);
    return json({ error: 'Could not generate download link.' }, { status: 500 });
  }
}