/**
 * SAML OAuth API Routes
 * Handles SAML authentication flow via Jackson
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJacksonInstance } from '@/lib/jackson';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const jackson = await getJacksonInstance();
    const path = params.path.join('/');
    
    // Handle different SAML endpoints
    switch (path) {
      case 'authorize':
        return handleAuthorize(request, jackson);
      case 'token':
        return handleToken(request, jackson);
      case 'userinfo':
        return handleUserInfo(request, jackson);
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('SAML OAuth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const jackson = await getJacksonInstance();
    const path = params.path.join('/');
    
    switch (path) {
      case 'token':
        return handleToken(request, jackson);
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('SAML OAuth POST error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

async function handleAuthorize(request: NextRequest, jackson: any) {
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get('tenant') || 'default';
  const product = searchParams.get('product') || 'default';
  
  try {
    const { redirectUrl } = await jackson.authorize({
      tenant,
      product,
      state: searchParams.get('state') || 'default',
      redirectUrl: searchParams.get('redirect_uri') || `${process.env.NEXTAUTH_URL}/dashboard`,
    });
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Authorization error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/error?error=authorization_failed`);
  }
}

async function handleToken(request: NextRequest, jackson: any) {
  try {
    const body = await request.json();
    const { code, state } = body;
    
    const tokenResponse = await jackson.token({
      code,
      state,
    });
    
    return NextResponse.json(tokenResponse);
  } catch (error) {
    console.error('Token error:', error);
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 400 }
    );
  }
}

async function handleUserInfo(request: NextRequest, jackson: any) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const userInfo = await jackson.userInfo(token);
    
    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('UserInfo error:', error);
    return NextResponse.json(
      { error: 'User info retrieval failed' },
      { status: 400 }
    );
  }
}
