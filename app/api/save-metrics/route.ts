import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'

export const runtime = 'nodejs'

/**
 * /api/save-metrics
 * ---------------------------------------------------------------------------
 * Persists onboarding calibration data for the authenticated dealership user.
 * Expected body:
 * {
 *   dealer?: string,
 *   pvr: number,
 *   adPvr?: number,  // Also accepts adExpensePvr for backward compatibility
 *   adExpensePvr?: number,
 *   aiv?: number,
 *   ati?: number,
 *   metrics?: {
 *     schemaCoverage?: number,
 *     trustScore?: number,
 *     cwv?: number,
 *     ugcHealth?: number,
 *     geoIntegrity?: number,
 *   }
 * }
 *
 * Optionally includes additional KPI context (schemaCoverage, trustScore, etc.)
 */

// Flexible schema that supports both old and new formats
const schema = z.object({
  dealer: z.string().min(3).optional(),
  pvr: z.number().min(0),
  // Support both adPvr and adExpensePvr for backward compatibility
  adPvr: z.number().min(0).optional(),
  adExpensePvr: z.number().min(0).optional(),
  aiv: z.number().min(0).max(1).optional(),
  ati: z.number().min(0).max(1).optional(),
  metrics: z
    .object({
      schemaCoverage: z.number().optional(),
      trustScore: z.number().optional(),
      cwv: z.number().optional(),
      ugcHealth: z.number().optional(),
      geoIntegrity: z.number().optional(),
    })
    .optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Ensure the user is authenticated
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
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

    // Normalize adPvr/adExpensePvr for backward compatibility
    if (body.adExpensePvr !== undefined && body.adPvr === undefined) {
      body.adPvr = body.adExpensePvr
    }

    // Validate with zod schema
    const validationResult = schema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Ensure adPvr is present (required for ROI calculation)
    if (data.adPvr === undefined) {
      return NextResponse.json(
        { ok: false, error: 'adPvr or adExpensePvr is required' },
        { status: 400 }
      )
    }

    // Derived KPI insights
    const grossProfitMargin = data.pvr - data.adPvr
    const roi =
      data.adPvr > 0
        ? Math.round(((data.pvr - data.adPvr) / data.adPvr) * 100)
        : null

    // Construct payload to persist
    const payload = {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      dealer: data.dealer || user.publicMetadata?.dealer || 'unknown',
      role: (user.publicMetadata?.role as string) || 'GM',
      pvr: data.pvr,
      adPvr: data.adPvr,
      aiv: data.aiv,
      ati: data.ati,
      roi,
      grossProfitMargin,
      metrics: data.metrics || {},
      completedAt: new Date().toISOString(),
    }

    // Get existing metadata
    const existingMetadata = (user.publicMetadata || {}) as Record<string, any>

    // Prepare updated metadata (merge with existing)
    const updatedMetadata: Record<string, any> = {
      ...existingMetadata,
      pvr: data.pvr,
      adExpensePvr: data.adPvr, // Keep adExpensePvr for backward compatibility
      adPvr: data.adPvr,
      ...(data.dealer && { dealer: data.dealer }),
      ...(data.aiv !== undefined && { aiv: data.aiv }),
      ...(data.ati !== undefined && { ati: data.ati }),
      ...(roi !== null && { roi }),
      ...(data.metrics && { metrics: data.metrics }),
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

    // 🚀 OPTION 1: Save to your orchestrator API (preferred for production)
    // Uncomment when ready:
    // if (process.env.ORCHESTRATOR_API && process.env.ORCHESTRATOR_TOKEN) {
    //   try {
    //     await fetch(`${process.env.ORCHESTRATOR_API}/metrics/save`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${process.env.ORCHESTRATOR_TOKEN}`,
    //       },
    //       body: JSON.stringify(payload),
    //     })
    //   } catch (error) {
    //     console.error('Failed to save to orchestrator:', error)
    //   }
    // }

    // 🚀 OPTION 2: Save to Supabase (example)
    // Uncomment when ready:
    // if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    //   const { createClient } = await import('@supabase/supabase-js')
    //   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    //   await supabase.from('dealership_metrics').insert(payload)
    // }

    // 🚀 OPTION 3: Save to Redis (example)
    // Uncomment when ready:
    // if (process.env.REDIS_URL) {
    //   const redis = await import('@upstash/redis').then(m => m.Redis.fromEnv())
    //   await redis.hset(`dealer:${data.dealer}`, payload)
    // }

    // For PLG analytics tracking
    console.log('✅ [Metrics Saved]', payload)

    return NextResponse.json({
      ok: true,
      message: 'Metrics saved successfully',
      roi,
      payload,
      metadata: updatedMetadata,
    })
  } catch (error: any) {
    console.error('[save-metrics] Error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

