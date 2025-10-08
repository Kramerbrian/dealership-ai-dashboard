import { NextRequest, NextResponse } from 'next/server'
import { createCustomerPortalSession } from '../../../../lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json()

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      )
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`
    const session = await createCustomerPortalSession(tenantId, returnUrl)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}
