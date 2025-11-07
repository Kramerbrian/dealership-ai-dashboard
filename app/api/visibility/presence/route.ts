import {NextResponse} from 'next/server';
import {withAuth} from '../../_utils/withAuth';
import {cacheJSON} from '@/lib/cache';
import {getIntegration} from '@/lib/integrations/store';

export const GET = withAuth(async ({req, tenantId}) => {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') || 'example.com';
  const integ = await getIntegration(tenantId, 'visibility');
  const enginesPref = integ?.metadata?.engines || {
    ChatGPT: true,
    Perplexity: true,
    Gemini: true,
    Copilot: true
  };
  
  const key = `visibility:${tenantId}:${domain}`;
  const data = await cacheJSON(key, 120, async () => {
    const engines = [
      enginesPref.ChatGPT ? {name: 'ChatGPT' as const, presencePct: 89} : null,
      enginesPref.Perplexity ? {name: 'Perplexity' as const, presencePct: 78} : null,
      enginesPref.Gemini ? {name: 'Gemini' as const, presencePct: 72} : null,
      enginesPref.Copilot ? {name: 'Copilot' as const, presencePct: 64} : null
    ].filter(Boolean) as Array<{name: 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Copilot'; presencePct: number}>;
    
    return {
      domain,
      engines,
      lastCheckedISO: new Date().toISOString(),
      connected: true
    };
  });
  
  return NextResponse.json(data);
});

