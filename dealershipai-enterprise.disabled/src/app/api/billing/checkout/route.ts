import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '../../../../lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { tenantId, plan } = await req.json()

    if (!tenantId || !plan) {
      return NextResponse.json(
        { error: 'Tenant ID and plan required' },
        { status: 400 }
      )
    }

    const session = await (createCheckoutSession as any)(tenantId, plan)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
