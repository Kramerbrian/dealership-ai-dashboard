import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/demo'
  
  // Simulate OAuth authorization
  const state = searchParams.get('state') || 'demo-state'
  const code = 'demo-code-123'
  
  // Redirect to callback with authorization code
  const callbackUrlWithCode = new URL('/api/auth/callback/demo', req.url)
  callbackUrlWithCode.searchParams.set('code', code)
  callbackUrlWithCode.searchParams.set('state', state)
  
  return NextResponse.redirect(callbackUrlWithCode)
}
