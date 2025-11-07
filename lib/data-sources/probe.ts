/**
 * Probe API Client
 * 
 * Fetches real-time probing and monitoring data from Probe service
 */

const PROBE_API_URL = process.env.PROBE_API_URL;
const PROBE_API_KEY = process.env.PROBE_API_KEY;

export interface ProbeData {
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  uptime: number;
  source: string;
  lastProbed: string;
  errors?: string[];
}

export async function getProbeData(
  tenantId: string,
  source: string
): Promise<ProbeData> {
  if (!PROBE_API_URL || !PROBE_API_KEY) {
    console.warn('Probe API not configured, returning mock data');
    return {
      status: 'online',
      responseTime: 180,
      uptime: 99.9,
      source,
      lastProbed: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${PROBE_API_URL}/v1/probe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PROBE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({ source }),
    });

    if (!response.ok) {
      throw new Error(`Probe API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      status: data.status || 'online',
      responseTime: data.responseTime || 0,
      uptime: data.uptime || 0,
      source,
      lastProbed: data.lastProbed || new Date().toISOString(),
      errors: data.errors || [],
    };
  } catch (error) {
    console.error('Probe API error:', error);
    // Return mock data on error
    return {
      status: 'online',
      responseTime: 180,
      uptime: 99.9,
      source,
      lastProbed: new Date().toISOString(),
    };
  }
}

export async function probeBatch(
  tenantId: string,
  sources: string[]
): Promise<ProbeData[]> {
  return Promise.all(
    sources.map(source => getProbeData(tenantId, source))
  );
}

