/**
 * Pulse API Client
 * 
 * Fetches visibility and proximity data from Pulse service
 */

const PULSE_API_URL = process.env.PULSE_API_URL;
const PULSE_API_KEY = process.env.PULSE_API_KEY;

export interface PulseData {
  visibility: number;
  proximity: number;
  scsPct: number;
  source: string;
  lastUpdated: string;
}

export async function getPulseData(
  tenantId: string,
  domainOrSource: string
): Promise<PulseData> {
  if (!PULSE_API_URL || !PULSE_API_KEY) {
    console.warn('Pulse API not configured, returning mock data');
    return {
      visibility: 0.68,
      proximity: 0.55,
      scsPct: 92,
      source: domainOrSource,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${PULSE_API_URL}/v1/visibility`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PULSE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({ 
        domain: domainOrSource,
        source: domainOrSource,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pulse API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      visibility: data.visibility || 0,
      proximity: data.proximity || 0,
      scsPct: data.scsPct || 0,
      source: domainOrSource,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Pulse API error:', error);
    // Return mock data on error
    return {
      visibility: 0.68,
      proximity: 0.55,
      scsPct: 92,
      source: domainOrSource,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getPulseDataBatch(
  tenantId: string,
  sources: string[]
): Promise<PulseData[]> {
  return Promise.all(
    sources.map(source => getPulseData(tenantId, source))
  );
}

