/**
 * CIS (Citation Index Score) API Client
 * 
 * Fetches citation and reference data from CIS service
 */

const CIS_API_URL = process.env.CIS_API_URL;
const CIS_API_KEY = process.env.CIS_API_KEY;

export interface CISData {
  citationCount: number;
  referenceScore: number;
  source: string;
  domains: string[];
  lastUpdated: string;
}

export async function getCISData(
  tenantId: string,
  source: string
): Promise<CISData> {
  if (!CIS_API_URL || !CIS_API_KEY) {
    console.warn('CIS API not configured, returning mock data');
    return {
      citationCount: 0,
      referenceScore: 0.75,
      source,
      domains: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${CIS_API_URL}/v1/citations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CIS_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({ source }),
    });

    if (!response.ok) {
      throw new Error(`CIS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      citationCount: data.citationCount || 0,
      referenceScore: data.referenceScore || 0,
      source,
      domains: data.domains || [],
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('CIS API error:', error);
    // Return mock data on error
    return {
      citationCount: 0,
      referenceScore: 0.75,
      source,
      domains: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

