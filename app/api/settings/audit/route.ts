import { NextRequest, NextResponse } from 'next/server';
import { auditAllIntegrations, logAuditResult } from '@/lib/services/integration-audit';

/**
 * POST /api/settings/audit
 * Runs a comprehensive audit of all dealer integrations
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId } = body;

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    // Fetch dealer settings
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: settings, error } = await supabase
      .from('dealer_settings')
      .select('*')
      .eq('dealer_id', dealerId)
      .single();

    if (error || !settings) {
      return NextResponse.json(
        { error: 'Settings not found for dealer' },
        { status: 404 }
      );
    }

    // Map database columns to expected format
    const settingsData = {
      analytics: settings.analytics,
      googleBusinessProfile: settings.google_business_profile,
      google: settings.google_services,
      social: settings.social_media,
      reviews: settings.reviews,
    };

    // Run comprehensive audit
    const auditResults = await auditAllIntegrations(dealerId, settingsData);

    // Log each result
    for (const result of auditResults.integrations) {
      await logAuditResult(dealerId, result.integration, result);
    }

    return NextResponse.json(auditResults);
  } catch (error: any) {
    console.error('Error running integration audit:', error);
    return NextResponse.json(
      { error: 'Failed to run audit', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/settings/audit?dealerId=xxx
 * Retrieves the last audit results for a dealer
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get latest audit results grouped by integration
    const { data: auditLog, error } = await supabase
      .from('integration_audit_log')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('checked_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    // Group by integration name and take the most recent
    const latestResults = new Map();
    for (const log of auditLog || []) {
      if (!latestResults.has(log.integration_name)) {
        latestResults.set(log.integration_name, {
          integration: log.integration_name,
          status: log.status,
          isValid: log.is_valid,
          message: log.message,
          lastChecked: log.checked_at,
          responseTime: log.response_time_ms,
          errorDetails: log.error_details,
          dataPoints: log.data_points,
        });
      }
    }

    const integrations = Array.from(latestResults.values());
    const activeCount = integrations.filter((i) => i.status === 'active').length;
    const failedCount = integrations.filter((i) => i.status === 'error').length;

    let overall: 'healthy' | 'degraded' | 'critical';
    if (failedCount === 0) {
      overall = 'healthy';
    } else if (failedCount <= integrations.length / 2) {
      overall = 'degraded';
    } else {
      overall = 'critical';
    }

    return NextResponse.json({
      dealerId,
      overall,
      totalIntegrations: integrations.length,
      activeIntegrations: activeCount,
      failedIntegrations: failedCount,
      integrations,
      lastAudit: auditLog?.[0]?.checked_at || null,
    });
  } catch (error: any) {
    console.error('Error fetching audit results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit results', details: error.message },
      { status: 500 }
    );
  }
}
