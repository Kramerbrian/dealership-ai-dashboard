import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Simulate OAuth user info
  const userInfo = {
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@dealershipai.com',
    avatar_url: 'https://via.placeholder.com/150',
    login: 'demo-user',
    company: 'DealershipAI',
    location: 'Naples, FL',
    bio: 'Demo user for testing authentication'
  }
  
  return NextResponse.json(userInfo)
}
