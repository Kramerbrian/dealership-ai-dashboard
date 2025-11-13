/**
 * Site-Inject Client
 * Client for injecting schema/fixes into dealer websites
 */

const BASE = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || '';
const KEY = process.env.X_API_KEY || '';

export interface SiteInjectPayload {
  hosts: string[];
  head_html: string;
  footer_html?: string;
}

export interface SiteInjectResponse {
  ok: boolean;
  version_id?: string;
  error?: string;
}

export async function siteInject(payload: SiteInjectPayload): Promise<SiteInjectResponse> {
  if (!BASE) {
    return { ok: false, error: 'FLEET_API_BASE not set' };
  }

  try {
    const url = new URL('/api/site-inject', BASE);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'x-api-key': KEY,
        'content-type': 'application/json',
        'X-Orchestrator-Role': 'AI_CSO',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Site inject error:', error);
    return { ok: false, error: error.message };
  }
}

