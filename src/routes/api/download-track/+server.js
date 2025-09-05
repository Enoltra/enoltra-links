// src/routes/api/download-track/+server.js

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { PRIVATE_R2_ACCOUNT_ID, PRIVATE_R2_ACCESS_KEY_ID, PRIVATE_R2_SECRET_ACCESS_KEY, PRIVATE_R2_BUCKET_NAME } from '$env/static/private';

const fileName = "N'SYNC - Bye Bye Bye (Enoltra Bootleg).wav"; // Make sure this is the exact filename

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${PRIVATE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: PRIVATE_R2_ACCESS_KEY_ID,
    secretAccessKey: PRIVATE_R2_SECRET_ACCESS_KEY,
  },
});

export async function GET() {
  try {
    const command = new GetObjectCommand({
      Bucket: PRIVATE_R2_BUCKET_NAME,
      Key: fileName,
    });

    // 1. Fetch the object directly from R2 on the server
    const r2Object = await S3.send(command);

    if (!r2Object.Body) {
      throw new Error('File not found in R2 bucket.');
    }

    // 2. Create a new response, streaming the file's body
    const response = new Response(r2Object.Body.transformToWebStream(), {
      headers: {
        // 3. Set the crucial headers to force a download
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': r2Object.ContentType || 'application/octet-stream',
        'Content-Length': r2Object.ContentLength.toString(),
      },
    });

    return response;

  } catch (err) {
    console.error("Error streaming file from R2:", err);
    return new Response('Error fetching file.', { status: 500 });
  }
}