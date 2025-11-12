import { API_BASE_URL, ORCHESTRATOR_TOKEN } from './apiConfig';

export type HttpMethod = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';

export async function apiFetch<T = any>(
  path: string,
  opts: { method?: HttpMethod; body?: any; headers?: Record<string,string> } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string,string> = {
    'Content-Type':'application/json',
    ...(opts.headers || {})
  };
  if (ORCHESTRATOR_TOKEN) headers.Authorization = `Bearer ${ORCHESTRATOR_TOKEN}`;
  
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store'
  });
  
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  
  return res.json();
}

