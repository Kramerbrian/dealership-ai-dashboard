import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface AEMDCalculationInput {
  tenant_id: string;
  report_date: string;
  ctr_p3: number;
  ctr_fs: number;
  total_vdp_views: number;
  vdp_views_ai: number;
  total_assisted_conversions: number;
  assisted_conversions_paa: number;
  omega_def?: number;
}

interface AEMDMetric {
  id: string;
  tenant_id: string;
  report_date: string;
  aemd_final: number;
  fs_score: number;
  aio_score: number;
  paa_score: number;
  omega_fs: number;
  omega_aio: number;
  omega_paa: number;
  created_at: string;
  updated_at: string;
}

/**
 * Calculate AEMD (AI Economic Metric Dashboard) Score
 * Formula: ωDef * Σ(Metric_i * ΩFin_i)
 */
function calculateAEMD(input: AEMDCalculationInput) {
  const {
    ctr_p3,
    ctr_fs,
    total_vdp_views,
    vdp_views_ai,
    total_assisted_conversions,
    assisted_conversions_paa,
    omega_def = 1.0,
  } = input;

  // Financial weights (ΩFin)
  const omega_fs = 0.30;
  const omega_aio = 0.50;
  const omega_paa = 0.20;

  // Calculate component scores
  // FS: Form Submissions CTR comparison
  const fs_score = (ctr_p3 / ctr_fs) * omega_fs;

  // AIO: AI Outcomes (VDP Views ratio)
  const aio_score = (total_vdp_views / vdp_views_ai) * omega_aio;

  // PAA: Predicted Assisted Actions (Conversion assistance)
  const paa_score = (total_assisted_conversions / assisted_conversions_paa) * omega_paa;

  // Final AEMD score: ωDef * Σ(scores)
  const aemd_final = omega_def * (fs_score + aio_score + paa_score);

  return {
    fs_score,
    aio_score,
    paa_score,
    omega_fs,
    omega_aio,
    omega_paa,
    aemd_final,
  };
}

/**
 * POST /api/aemd-metrics
 * Calculate and store AEMD metrics
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: AEMDCalculationInput = await req.json();

    // Validate required fields
    const requiredFields = [
      'tenant_id',
      'report_date',
      'ctr_p3',
      'ctr_fs',
      'total_vdp_views',
      'vdp_views_ai',
      'total_assisted_conversions',
      'assisted_conversions_paa',
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate AEMD metrics
    const calculated = calculateAEMD(body);

    // Store in database
    const { data, error } = await supabase
      .from('aemd_metrics')
      .upsert({
        tenant_id: body.tenant_id,
        report_date: body.report_date,
        ctr_p3: body.ctr_p3,
        ctr_fs: body.ctr_fs,
        total_vdp_views: body.total_vdp_views,
        vdp_views_ai: body.vdp_views_ai,
        total_assisted_conversions: body.total_assisted_conversions,
        assisted_conversions_paa: body.assisted_conversions_paa,
        omega_def: body.omega_def || 1.0,
        ...calculated,
        calculation_version: 'v1.0',
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing AEMD metrics:', error);
      return NextResponse.json(
        { error: 'Failed to store AEMD metrics', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      calculation: calculated,
    });
  } catch (error) {
    console.error('Error in POST /api/aemd-metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aemd-metrics?tenant_id=xxx&start_date=xxx&end_date=xxx
 * Retrieve AEMD metrics for a tenant
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(req.url);

    const tenant_id = searchParams.get('tenant_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '30');

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('aemd_metrics')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('report_date', { ascending: false })
      .limit(limit);

    if (start_date) {
      query = query.gte('report_date', start_date);
    }

    if (end_date) {
      query = query.lte('report_date', end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching AEMD metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AEMD metrics', details: error.message },
        { status: 500 }
      );
    }

    // Calculate statistics
    const metrics = data as AEMDMetric[];
    const stats = {
      count: metrics.length,
      avg_aemd_final: metrics.reduce((sum, m) => sum + Number(m.aemd_final), 0) / metrics.length || 0,
      max_aemd_final: Math.max(...metrics.map(m => Number(m.aemd_final))),
      min_aemd_final: Math.min(...metrics.map(m => Number(m.aemd_final))),
      latest_date: metrics[0]?.report_date,
      avg_fs_score: metrics.reduce((sum, m) => sum + Number(m.fs_score), 0) / metrics.length || 0,
      avg_aio_score: metrics.reduce((sum, m) => sum + Number(m.aio_score), 0) / metrics.length || 0,
      avg_paa_score: metrics.reduce((sum, m) => sum + Number(m.paa_score), 0) / metrics.length || 0,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/aemd-metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/aemd-metrics
 * Update AEMD metric notes or recalculate
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const { id, notes, recalculate } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (recalculate) {
      // Fetch existing record
      const { data: existing, error: fetchError } = await supabase
        .from('aemd_metrics')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json(
          { error: 'AEMD metric not found' },
          { status: 404 }
        );
      }

      // Recalculate
      const calculated = calculateAEMD(existing);
      updateData = { ...updateData, ...calculated };
    }

    const { data, error } = await supabase
      .from('aemd_metrics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating AEMD metrics:', error);
      return NextResponse.json(
        { error: 'Failed to update AEMD metrics', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in PUT /api/aemd-metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
