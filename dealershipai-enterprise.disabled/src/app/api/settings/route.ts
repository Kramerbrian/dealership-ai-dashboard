import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock Settings data - replace with real data source
    const settingsData = {
      dealership: {
        name: 'Example Dealership',
        domain: 'example-dealership.com',
        location: 'San Francisco, CA',
        phone: '(555) 123-4567'
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        frequency: 'daily'
      },
      integrations: {
        googleAnalytics: { connected: true, lastSync: new Date().toISOString() },
        googleMyBusiness: { connected: true, lastSync: new Date().toISOString() },
        facebook: { connected: false },
        instagram: { connected: false }
      },
      preferences: {
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        language: 'en'
      }
    }

    return NextResponse.json(settingsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings data' },
      { status: 500 }
    )
  }
}
