import { NextRequest, NextResponse } from 'next/server';
import { createAdminRoute } from '@/lib/api/enhanced-route';
import { traced } from '@/lib/api-wrap';

/**
 * GET /api/admin/integrations/visibility
 * Get visibility integration settings for tenant
 */
export const GET = createAdminRoute(traced(async (req: NextRequest) => {

  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenantId') || 'default';

    // In production, fetch from database
    const integration = {
      tenantId,
      kind: 'visibility',
      engines: {
        ChatGPT: true,
        Perplexity: true,
        Gemini: true,
        Copilot: true,
      },
      thresholds: {
        ChatGPT: { warn: 80, critical: 70 },
        Perplexity: { warn: 75, critical: 65 },
        Gemini: { warn: 75, critical: 70 },
        Copilot: { warn: 72, critical: 65 },
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, integration });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch integration' },
      { status: 500 }
    );
  }
}, 'admin.integrations.visibility.get'));

/**
 * POST /api/admin/integrations/visibility
 * Update visibility integration settings for tenant
 */
export const POST = traced(async (req: NextRequest) => {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.reason },
      { status: gate.reason === 'unauthenticated' ? 401 : 403 }
    );
  }

  try {
    const body = await req.json();
    const { tenantId = 'default', engines, thresholds } = body;

    // In production, persist to database
    // await upsertIntegration({ tenantId, kind: 'visibility', engines, thresholds });

    return NextResponse.json({
      ok: true,
      integration: {
        tenantId,
        kind: 'visibility',
        engines: engines || {
          ChatGPT: true,
          Perplexity: true,
          Gemini: true,
          Copilot: true,
        },
        thresholds: thresholds || {
          ChatGPT: { warn: 80, critical: 70 },
          Perplexity: { warn: 75, critical: 65 },
          Gemini: { warn: 75, critical: 70 },
          Copilot: { warn: 72, critical: 65 },
        },
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update integration' },
      { status: 500 }
    );
  }
}, 'admin.integrations.visibility.post');


