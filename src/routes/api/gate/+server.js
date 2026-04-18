import { json } from '@sveltejs/kit';
import {
  PRIVATE_EMAILOCTOPUS_API_KEY,
  PRIVATE_EMAILOCTOPUS_LIST_ID,
  PRIVATE_EMAIL_VALIDATION_API_KEY
} from '$env/static/private';

// Track registry — add new tracks here as objects
const TRACKS = {
  'bye-bye-bye': {
    downloadUrl: 'https://downloads.enoltra.com/NSYNC%20-%20Bye%20Bye%20Bye%20(Enoltra%20Bootleg).wav',
    songName: 'Bye Bye Bye (Enoltra Bootleg)'
  },
  'played-a-live': {
    downloadUrl: 'https://downloads.enoltra.com/Safri%20Duo%20-%20Played-A-Live%20(Enoltra%20Bootleg).mp3',
    songName: 'Played-A-Live (Enoltra Bootleg)'
  }
};

// Allow Framer and other external frontends to call this endpoint
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, { status: 400, headers: corsHeaders() });
  }

  const { email, track } = body;

  if (!email) {
    return json({ error: 'Email is required.' }, { status: 400, headers: corsHeaders() });
  }

  const trackData = TRACKS[track];
  if (!trackData) {
    return json({ error: 'Unknown track.' }, { status: 400, headers: corsHeaders() });
  }

  // Step 1: Validate email via AbstractAPI
  try {
    const validationResponse = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${PRIVATE_EMAIL_VALIDATION_API_KEY}&email=${email}`
    );
    const validationData = await validationResponse.json();
    if (validationData.deliverability !== 'DELIVERABLE') {
      return json({ error: 'Invalid e-mail. Please enter a valid e-mail.' }, { status: 400, headers: corsHeaders() });
    }
  } catch {
    return json({ error: 'Could not verify email at this time.' }, { status: 500, headers: corsHeaders() });
  }

  const { downloadUrl, songName } = trackData;

  // Step 2: Subscribe to EmailOctopus
  try {
    const createResponse = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
          email_address: email,
          fields: {
            DownloadLinkNSYNC: downloadUrl,
            SongName: songName
          },
          status: 'SUBSCRIBED'
        })
      }
    );

    if (createResponse.ok) {
      return json({ success: true, downloadUrl }, { headers: corsHeaders() });
    }

    const errorData = await createResponse.json();

    // Subscriber already exists — update their record and still return the link
    if (errorData.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
      const searchResponse = await fetch(
        `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts?api_key=${PRIVATE_EMAILOCTOPUS_API_KEY}&limit=100`
      );
      const searchData = await searchResponse.json();
      const existing = searchData.data?.find(
        (c) => c.email_address.toLowerCase() === email.toLowerCase()
      );

      if (!existing) {
        return json({ error: 'Could not retrieve your subscription.' }, { status: 500, headers: corsHeaders() });
      }

      await fetch(
        `https://emailoctopus.com/api/1.6/lists/${PRIVATE_EMAILOCTOPUS_LIST_ID}/contacts/${existing.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: PRIVATE_EMAILOCTOPUS_API_KEY,
            fields: {
              DownloadLinkNSYNC: downloadUrl,
              SongName: songName
            },
            status: 'SUBSCRIBED'
          })
        }
      );

      return json({ success: true, downloadUrl }, { headers: corsHeaders() });
    }

    return json(
      { error: errorData.error?.message || 'Could not subscribe.' },
      { status: 400, headers: corsHeaders() }
    );
  } catch {
    return json({ error: 'A server error occurred.' }, { status: 500, headers: corsHeaders() });
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
