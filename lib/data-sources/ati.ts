/**
 * ATI (Authority Trust Index) API Client
 * 
 * Fetches authority and trust metrics from ATI service
 */

const ATI_API_URL = process.env.ATI_API_URL;
const ATI_API_KEY = process.env.ATI_API_KEY;

export interface ATIData {
  authority: number;
  trustScore: number;
  source: string;
  citations: number;
  lastUpdated: string;
}

export async function getATIData(
  tenantId: string,
  source: string
): Promise<ATIData> {
  if (!ATI_API_URL || !ATI_API_KEY) {
    console.warn('ATI API not configured, returning mock data');
    return {
      authority: 0.81,
      trustScore: 0.85,
      source,
      citations: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${ATI_API_URL}/v1/authority`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ATI_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({ source }),
    });

    if (!response.ok) {
      throw new Error(`ATI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      authority: data.authority || 0,
      trustScore: data.trustScore || 0,
      source,
      citations: data.citations || 0,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('ATI API error:', error);
    // Return mock data on error
    return {
      authority: 0.81,
      trustScore: 0.85,
      source,
      citations: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getATIDataBatch(
  tenantId: string,
  sources: string[]
): Promise<ATIData[]> {
  return Promise.all(
    sources.map(source => getATIData(tenantId, source))
  );
}

