import {NextResponse} from 'next/server';
import {withAuth} from '../../_utils/withAuth';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

export const GET = withAuth(async ({tenantId}) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPE,
    state: tenantId
  });
  
  return NextResponse.redirect(`${AUTH_URL}?${params.toString()}`);
});

