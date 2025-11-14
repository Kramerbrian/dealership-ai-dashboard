/**
 * OEM Monitor Endpoint
 * Watches OEM pressrooms for new model-year updates
 * 
 * Usage:
 * - Cron: POST /api/oem/monitor?oem=Toyota&url=https://pressroom.toyota.com/...
 * - Manual: POST /api/oem/monitor with body { oem, urls: [...] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { OEMModelUpdate } from '@/lib/oem/schema';
import { oemUpdateToPulseTiles } from '@/lib/oem/transformer';
import { routeOEMUpdateToTenants } from '@/lib/oem/brand-routing';
import { pushInboxTiles } from '@/lib/pulse/inbox';

export const runtime = 'nodejs'; // Need Node.js for OpenAI API calls
export const dynamic = 'force-dynamic';

interface MonitorRequest {
  oem: string; // e.g., "Toyota"
  urls?: string[]; // Specific URLs to check (optional)
  model?: string; // Specific model to watch (optional)
  filterByModel?: boolean; // Only route to dealers that stock this model
}

/**
 * Fetch and parse OEM pressroom content
 * Uses OpenAI Responses API with structured output
 */
export async function parseOEMContent(
  oem: string,
  url: string,
  brandGuidelines?: string
): Promise<OEMModelUpdate | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Fetch the pressroom page
  let html = '';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DealershipAI-OEM-Monitor/1.0)',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    html = await response.text();
  } catch (error) {
    console.error(`[oem/monitor] Failed to fetch ${url}:`, error);
    return null;
  }

  // Call OpenAI Responses API with structured output
  const systemPrompt = `You are the ${oem} Brand OEM Agent. Your job is to extract structured information about model-year updates from ${oem} pressroom pages.

Rules:
- Use only official ${oem} press material; no hype, no invented specs
- Use official model names (e.g., "Toyota Tacoma", "i-FORCE MAX"), no nicknames
- No competitor comparisons or promises beyond the source material
- Use neutral, factual tone; don't invent pricing
- Follow trademark capitalization (TRD, i-FORCE MAX, Toyota Safety Sense, etc.)
- Only extract information that is explicitly stated in the press material
${brandGuidelines ? `\nAdditional brand guidelines:\n${brandGuidelines}` : ''}

Extract:
1. Model name and year
2. Headline changes (what dealers need to know)
3. Powertrain specifications (hp, torque, MPG)
4. New or updated colors
5. Equipment changes (what's now standard/optional)
6. Pricing changes (if mentioned)
7. Availability windows (if mentioned)

Focus on information that is retail-relevant (dealers need to act on it).`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // or gpt-4-turbo
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Extract model-year update information from this ${oem} pressroom page:\n\nURL: ${url}\n\nHTML content (first 50k chars):\n${html.substring(0, 50000)}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'oem_model_update',
            strict: true,
            schema: require('@/lib/oem/schema').OEM_MODEL_SCHEMA,
          },
        },
        temperature: 0.1, // Low temperature for factual extraction
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content) as OEMModelUpdate;
    parsed.source_url = url;
    parsed.extracted_at = new Date().toISOString();

    return parsed;
  } catch (error) {
    console.error(`[oem/monitor] Failed to parse OEM content:`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as MonitorRequest;
    const { oem, urls, model, filterByModel = false } = body;

    if (!oem) {
      return NextResponse.json({ error: 'oem is required' }, { status: 400 });
    }

    // Default URLs if not provided (Toyota example)
    const defaultUrls: Record<string, string[]> = {
      Toyota: [
        'https://pressroom.toyota.com/whats-new-for-2026/',
        'https://pressroom.toyota.com/products/press-kits/',
      ],
      // Add other OEMs as needed
    };

    const urlsToCheck = urls || defaultUrls[oem] || [];
    if (urlsToCheck.length === 0) {
      return NextResponse.json({ error: 'No URLs to check' }, { status: 400 });
    }

    // Parse each URL
    const updates: OEMModelUpdate[] = [];
    for (const url of urlsToCheck) {
      const update = await parseOEMContent(oem, url);
      if (update) {
        updates.push(update);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No updates found',
        checked: urlsToCheck.length,
      });
    }

    // Transform to Pulse tiles and route to tenants
    let totalTilesPushed = 0;
    const results: Array<{ model: string; tenants: string[]; tiles: number }> = [];

    for (const update of updates) {
      // Filter by model if specified
      if (model && update.model.toLowerCase() !== model.toLowerCase()) {
        continue;
      }

      // Convert to Pulse tiles
      const tiles = oemUpdateToPulseTiles(update);

      // Route to appropriate tenants
      const tenants = await routeOEMUpdateToTenants(
        update.oem,
        update.model,
        filterByModel
      );

      // Push tiles to each tenant's inbox
      for (const tenant of tenants) {
        const pushed = await pushInboxTiles(tenant, tiles);
        totalTilesPushed += pushed;
      }

      results.push({
        model: `${update.year} ${update.model}`,
        tenants: tenants,
        tiles: tiles.length,
      });
    }

    return NextResponse.json({
      ok: true,
      updates: updates.length,
      tiles_pushed: totalTilesPushed,
      results,
    });
  } catch (error: any) {
    console.error('[oem/monitor] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const oem = url.searchParams.get('oem');
  const testUrl = url.searchParams.get('url');

  if (!oem || !testUrl) {
    return NextResponse.json(
      { error: 'Missing oem or url query params' },
      { status: 400 }
    );
  }

  const update = await parseOEMContent(oem, testUrl);
  if (!update) {
    return NextResponse.json({ error: 'Failed to parse OEM content' }, { status: 500 });
  }

  return NextResponse.json({ update, tiles: oemUpdateToPulseTiles(update) });
}

