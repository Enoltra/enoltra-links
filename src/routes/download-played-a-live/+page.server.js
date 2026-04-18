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

    if (!email) {
      return fail(400, { error: 'Email is required.' });
    }

    // Step 1: Validate email
    try {
      const validationResponse = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`
      );
      const validationData = await validationResponse.json();
      console.log('Email validation result:', JSON.stringify(validationData));
      if (validationData.deliverability !== 'DELIVERABLE') {
        return fail(400, { error: 'Invalid e-mail. Please enter a valid e-mail.' });
      }
    } catch (err) {
      console.error('Email validation error:', err);
      return fail(500, { error: 'Could not verify email at this time.' });
    }

    // Step 2: Generate signed URL
    let signedUrl;
    try {
      const command = new GetObjectCommand({
        Bucket: PRIVATE_R2_BUCKET_NAME,
        Key: 'Safri Duo - Played-A-Live (Enoltra Bootleg).mp3'
      });
      signedUrl = await getSignedUrl(S3, command, { expiresIn: 7 * 24 * 60 * 60 });
      console.log('Signed URL generated successfully');
    } catch (err) {
      console.error('R2 signed URL error:', err);
      return fail(500, { error: 'Could not generate download link.' });
    }

    // Step 3: Subscribe to EmailOctopus
    try {
      const payload = {
        api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
        email_address: email,
        fields: {
          DownloadLinkNSYNC: signedUrl,
          SongName: 'Played-A-Live (Enoltra Bootleg)'
        },
        status: 'SUBSCRIBED'
      };

      console.log('Sending to EmailOctopus, list:', PRIVATE_EMAILOCTOPUS_LIST_ID);
      console.log('Payload (no api key):', JSON.stringify({ ...payload, api_key: '[HIDDEN]' }));

      const createResponse = await fetch(
        `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await createResponse.text();
      console.log('EmailOctopus status:', createResponse.status);
      console.log('EmailOctopus response:', responseText);

      if (createResponse.ok) {
        return { success: true };
      }

      const errorData = JSON.parse(responseText);

      if (errorData.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
        // Find existing contact and update
        const searchResponse = await fetch(
          `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts?api_key=${PRIVATE_EMAILOCTOPUS_API_KEY}&limit=100`
        );
        const searchData = await searchResponse.json();
        const existing = searchData.data?.find(
          (c) => c.email_address.toLowerCase() === email.toLowerCase()
        );

        if (!existing) {
          return fail(500, { error: 'Could not retrieve your subscription.' });
        }

        const updateResponse = await fetch(
          `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${existing.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
              fields: {
                DownloadLinkNSYNC: signedUrl,
                SongName: 'Played-A-Live (Enoltra Bootleg)'
              },
              status: 'SUBSCRIBED'
            }),
          }
        );

        const updateText = await updateResponse.text();
        console.log('EmailOctopus update status:', updateResponse.status);
        console.log('EmailOctopus update response:', updateText);

        return { success: true };
      }

      return fail(400, { error: errorData.error?.message || 'Could not subscribe.' });

    } catch (err) {
      console.error('EmailOctopus error:', err);
      return fail(500, { error: 'A server error occurred.' });
    }
  }
};
