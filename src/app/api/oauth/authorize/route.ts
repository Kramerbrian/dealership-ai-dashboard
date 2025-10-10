import { NextRequest, NextResponse } from 'next/server'
import { getJackson } from '@/lib/jackson'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenant = searchParams.get('tenant') || 'default'
    const product = searchParams.get('product') || 'dealershipai'
    
    const oauthController = await getJackson()
    
    const { redirect_url } = await oauthController.authorize({
      tenant,
      product,
      state: searchParams.get('state') || '',
      redirect_uri: searchParams.get('redirect_uri') || `${process.env.NEXTAUTH_URL}/api/auth/callback/boxyhq-saml`,
    })
    
    return NextResponse.redirect(redirect_url)
  } catch (error) {
    console.error('OAuth authorize error:', error)
    return NextResponse.json({ error: 'Authorization failed' }, { status: 500 })
  }
}
