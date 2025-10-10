import { NextRequest, NextResponse } from 'next/server'
import { getJackson } from '@/lib/jackson'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const oauthController = await getJackson()
    const { searchParams } = new URL(request.url)
    const access_token = searchParams.get('access_token')
    
    if (!access_token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 })
    }
    
    const profile = await oauthController.userInfo(access_token)
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('User info error:', error)
    return NextResponse.json({ error: 'User info retrieval failed' }, { status: 500 })
  }
}
