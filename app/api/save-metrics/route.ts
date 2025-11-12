import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

export const runtime = 'nodejs'

/**
 * POST /api/save-metrics
 * Saves PVR (Parts, Vehicle, Repair) and Ad Expense PVR metrics
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let body
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { pvr, adExpensePvr } = body

    // Validate inputs
    if (pvr === undefined || adExpensePvr === undefined) {
      return NextResponse.json(
        { ok: false, error: 'PVR and Ad Expense PVR are required' },
        { status: 400 }
      )
    }

    // Validate numeric values
    const pvrNum = Number(pvr)
    const adExpensePvrNum = Number(adExpensePvr)

    if (isNaN(pvrNum) || isNaN(adExpensePvrNum)) {
      return NextResponse.json(
        { ok: false, error: 'PVR and Ad Expense PVR must be valid numbers' },
        { status: 400 }
      )
    }

    if (pvrNum < 0 || adExpensePvrNum < 0) {
      return NextResponse.json(
        { ok: false, error: 'PVR and Ad Expense PVR must be positive numbers' },
        { status: 400 }
      )
    }

    // Get existing metadata
    const existingMetadata = (user.publicMetadata || {}) as Record<string, any>

    // Prepare updated metadata
    const updatedMetadata: Record<string, any> = {
      ...existingMetadata,
      pvr: pvrNum,
      adExpensePvr: adExpensePvrNum,
      metricsSavedAt: new Date().toISOString(),
    }

    // Update Clerk metadata
    try {
      await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: updatedMetadata,
      })
    } catch (error: any) {
      console.error('Failed to update Clerk metadata:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to save metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Metrics saved successfully',
      metadata: updatedMetadata,
    })
  } catch (error: any) {
    console.error('Save metrics API error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save metrics' },
      { status: 500 }
    )
  }
}

