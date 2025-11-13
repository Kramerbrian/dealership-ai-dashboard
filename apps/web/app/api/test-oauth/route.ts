import { NextResponse } from 'next/server';

export async function GET() {
  const oauthStatus = {
    google: {
      configured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing'
    },
    microsoft: {
      configured: !!process.env.AZURE_AD_CLIENT_ID && !!process.env.AZURE_AD_CLIENT_SECRET && !!process.env.AZURE_AD_TENANT_ID,
      clientId: process.env.AZURE_AD_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ? 'Set' : 'Missing',
      tenantId: process.env.AZURE_AD_TENANT_ID ? 'Set' : 'Missing'
    },
    facebook: {
      configured: !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET,
      clientId: process.env.FACEBOOK_CLIENT_ID ? 'Set' : 'Missing',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ? 'Set' : 'Missing'
    },
    nextauth: {
      secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
      url: process.env.NEXTAUTH_URL || 'Not set'
    }
  };

  return NextResponse.json({
    status: 'OAuth Configuration Check',
    providers: oauthStatus,
    timestamp: new Date().toISOString()
  });
}
