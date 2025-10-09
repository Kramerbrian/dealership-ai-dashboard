import { NextRequest, NextResponse } from 'next/server'
import { getJackson } from '@/lib/jackson'

export async function POST(request: NextRequest) {
  try {
    const oauthController = await getJackson()
    const body = await request.text()
    
    const { access_token, token_type, expires_in } = await oauthController.token({ body })
    
    return NextResponse.json({ access_token, token_type, expires_in })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 })
  }
}
