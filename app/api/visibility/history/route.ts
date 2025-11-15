import { NextRequest, NextResponse } from 'next/server';
import { getSbAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Returns last 7 composite totals and per-engine presence (synthetic; replace with DB)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain") || undefined || "example.com";

    // Try to get from Supabase first
    const sbAdmin = getSbAdmin();
    if (sbAdmin) {
      try {
        const { data, error } = await sbAdmin
          .from('visibility_history')
          .select('*')
          .eq('domain', domain)
          .order('ts', { ascending: false })
          .limit(7);
        
        if (!error && data && data.length > 0) {
          const engines = ["ChatGPT", "Perplexity", "Gemini", "Copilot"] as const;
          const composite = data.map((row: any) => {
            const values = {
              ChatGPT: row.chatgpt_score || 0,
              Perplexity: row.perplexity_score || 0,
              Gemini: row.gemini_score || 0,
              Copilot: row.copilot_score || 0,
            };
            return Math.round(
              0.35 * values.ChatGPT +
              0.25 * values.Perplexity +
              0.25 * values.Gemini +
              0.15 * values.Copilot
            );
          });
          
          const rows = data.map((row: any) => ({
            dayOffset: Math.floor((Date.now() - new Date(row.ts).getTime()) / (1000 * 60 * 60 * 24)),
            engines: {
              ChatGPT: row.chatgpt_score || 0,
              Perplexity: row.perplexity_score || 0,
              Gemini: row.gemini_score || 0,
              Copilot: row.copilot_score || 0,
            },
          }));

          return NextResponse.json({
            domain,
            composite,
            rows,
            lastUpdatedISO: data[0]?.ts || new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('Supabase history fetch failed, using synthetic data:', e);
      }
    }

    // Fallback: synthetic 7 days with slight rise
    const engines = ["ChatGPT", "Perplexity", "Gemini", "Copilot"] as const;
    const days = 7;
    const rows = Array.from({ length: days }).map((_, i) => {
      const base = 70 + i * 2;
      const values = {
        ChatGPT: base + 10,
        Perplexity: base + 4,
        Gemini: base,
        Copilot: base - 6
      };
      return { dayOffset: days - i, engines: values };
    });
    
    // Provide precomputed composite too (your adapter may compute it from weights)
    const composite = rows.map(r => Math.round(
      0.35 * r.engines.ChatGPT +
      0.25 * r.engines.Perplexity +
      0.25 * r.engines.Gemini +
      0.15 * r.engines.Copilot
    ));
    
    return NextResponse.json({ domain, composite, rows, lastUpdatedISO: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

