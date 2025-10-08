import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Simulate OAuth token exchange
  const tokenResponse = {
    access_token: 'demo-access-token-123',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'demo-refresh-token-123',
    scope: 'read:user user:email'
  }
  
  return NextResponse.json(tokenResponse)
}
