/**
 * I2E API Client
 * 
 * Integration with DealershipAI Actions API
 * Connects I2E components to backend Pulse system
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dash.dealershipai.com';

export interface PulseSnapshot {
  date: string;
  dealership: string;
  pulses_closed: Array<{
    id: string;
    deltaUSD: number;
    timeToResolveMin: number;
  }>;
  scores: {
    AIV?: number;
    ATI?: number;
    CVI?: number;
  };
}

export interface PulseRecommendation {
  pulseId: string;
  plan: string;
  expectedImpactUSD?: number;
}

export interface FixRequest {
  pulseId: string;
  tier: 'preview' | 'apply' | 'autopilot';
}

export interface ReceiptRequest {
  pulseId: string;
  deltaUSD: number;
  success: boolean;
  notes?: string;
}

/**
 * Get normalized Pulse snapshot
 */
export async function getSnapshot(): Promise<PulseSnapshot> {
  const response = await fetch(`${API_BASE_URL}/api/orchestrator/snapshot`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch snapshot: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Submit GPT recommendations for a pulse
 */
export async function postRecommendation(recommendation: PulseRecommendation): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/pulse/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(recommendation),
  });

  if (!response.ok) {
    throw new Error(`Failed to post recommendation: ${response.statusText}`);
  }
}

/**
 * Execute a Tier-2 fix
 */
export async function applyFix(fixRequest: FixRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/fix/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(fixRequest),
  });

  if (!response.ok) {
    throw new Error(`Failed to apply fix: ${response.statusText}`);
  }
}

/**
 * Log a result for the learning loop
 */
export async function postReceipt(receipt: ReceiptRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/ledger/receipt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(receipt),
  });

  if (!response.ok) {
    throw new Error(`Failed to post receipt: ${response.statusText}`);
  }
}

