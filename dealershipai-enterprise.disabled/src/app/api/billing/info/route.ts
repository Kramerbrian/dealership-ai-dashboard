import { NextRequest, NextResponse } from 'next/server'
import { getBillingInfo } from '../../../../lib/stripe'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const billingInfo = await getBillingInfo(tenantId)

    if (!billingInfo) {
      // Return default billing info for test drive plan
      return NextResponse.json({
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        plan: 'test_drive',
        amount: 0,
      })
    }

    return NextResponse.json(billingInfo)
  } catch (error) {
    console.error('Billing info error:', error)
    return NextResponse.json(
      { error: 'Failed to get billing information' },
      { status: 500 }
    )
  }
}
