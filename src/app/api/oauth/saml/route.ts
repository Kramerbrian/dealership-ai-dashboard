import { NextRequest, NextResponse } from 'next/server'
import { getJackson } from '@/lib/jackson'

export async function POST(request: NextRequest) {
  try {
    const oauthController = await getJackson()
    const body = await request.text()
    
    const { redirect_url } = await oauthController.samlResponse({ body })
    
    return NextResponse.redirect(redirect_url)
  } catch (error) {
    console.error('SAML response error:', error)
    return NextResponse.json({ error: 'SAML processing failed' }, { status: 500 })
  }
}
