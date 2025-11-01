import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { securityAuditor } from '@/lib/security/audit'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { tier: true }
    })

    if (!user || user.tier !== 'ENTERPRISE') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Run security audit
    const report = await securityAuditor.generateSecurityReport()

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Security audit error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run security audit' },
      { status: 500 }
    )
  }
}
