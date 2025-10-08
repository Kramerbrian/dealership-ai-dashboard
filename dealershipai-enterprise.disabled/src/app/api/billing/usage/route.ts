import { NextRequest, NextResponse } from 'next/server'
import { getUsageInfo } from '../../../../lib/stripe'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const usageInfo = await getUsageInfo(tenantId)

    return NextResponse.json(usageInfo)
  } catch (error) {
    console.error('Usage info error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage information' },
      { status: 500 }
    )
  }
}
