import { env } from './env';

export async function proxyToFleet(
  path: string,
  init: RequestInit & { tenant?: string; role?: string } = {}
) {
  // If no Fleet API configured, throw error that will be caught and handled
  if (!env.FLEET_API_BASE) {
    throw new Error('FLEET_API_BASE not configured - using demo mode');
  }

  const url = new URL(path, env.FLEET_API_BASE);
  const headers = Object.assign(
    { 'content-type': 'application/json', 'x-api-key': env.X_API_KEY },
    init.headers || {},
    init?.tenant ? { 'x-tenant': init.tenant } : {},
    init?.role ? { 'x-role': init.role } : {}
  );
  const res = await fetch(url.toString(), { ...init, headers });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Upstream error ${res.status}: ${msg}`);
  }
  return res;
}

