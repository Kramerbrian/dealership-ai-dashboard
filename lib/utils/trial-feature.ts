/**
 * Trial Feature Management
 * 
 * Handles 24-hour trial feature unlocks for Tier 1 users
 * Checks cookies, headers, and localStorage for client-side checks
 */

import { cookies } from 'next/headers';

export interface TrialFeature {
  feature_id: string;
  unlocked_at: string;
  expires_at: string;
}

const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Client-side: Check if a trial feature is currently active
 * Checks cookies, headers, and localStorage
 */
export function isTrialActive(featureId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  // 1. Check for x-dai-trial-* header (set by middleware)
  // Note: Headers are not directly accessible in client-side code,
  // but we can check cookies and localStorage
  
  // 2. Check cookie (if available client-side, though HttpOnly cookies won't be accessible)
  // For now, we'll check localStorage which is set when the cookie is created
  
  // 3. Check localStorage
  const stored = localStorage.getItem(`dai:trial:${featureId}`);
  if (stored) {
    try {
      const trialData: TrialFeature = JSON.parse(stored);
      const expiresAt = new Date(trialData.expires_at).getTime();
      const now = Date.now();
      
      if (now > expiresAt) {
        // Expired - remove it
        localStorage.removeItem(`dai:trial:${featureId}`);
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
  
  // 4. Check via API endpoint (async check)
  // This is a fallback - typically we'd want to call /api/trial/status once on mount
  
  return false;
}

/**
 * Client-side: Fetch active trials from API
 */
export async function fetchActiveTrials(): Promise<string[]> {
  try {
    const response = await fetch('/api/trial/status', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data?.active || [];
  } catch {
    return [];
  }
}

/**
 * Client-side: Check if a specific trial is active (async)
 */
export async function isTrialActiveAsync(featureId: string): Promise<boolean> {
  const active = await fetchActiveTrials();
  return active.includes(featureId);
}

/**
 * Get remaining trial time in hours
 */
export function getTrialTimeRemaining(featureId: string): number {
  if (typeof window === 'undefined') return 0;
  
  const stored = localStorage.getItem(`dai:trial:${featureId}`);
  if (!stored) return 0;
  
  try {
    const trialData: TrialFeature = JSON.parse(stored);
    const expiresAt = new Date(trialData.expires_at).getTime();
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 0;
    
    return Math.ceil(remaining / (60 * 60 * 1000)); // Hours
  } catch {
    return 0;
  }
}

/**
 * Server-side: Check trial feature from cookie
 */
export async function getTrialFeatureFromCookie(featureId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const trialCookie = cookieStore.get(`dai_trial_${featureId}`);
    
    if (!trialCookie) return false;
    
    const trialData: TrialFeature = JSON.parse(trialCookie.value);
    const expiresAt = new Date(trialData.expires_at).getTime();
    const now = Date.now();
    
    return now <= expiresAt;
  } catch {
    return false;
  }
}

/**
 * Server-side: Set trial feature cookie
 */
export async function setTrialFeatureCookie(featureId: string): Promise<string> {
  const now = Date.now();
  const expiresAt = new Date(now + TRIAL_DURATION_MS).toISOString();
  
  const trialData: TrialFeature = {
    feature_id: featureId,
    unlocked_at: new Date(now).toISOString(),
    expires_at: expiresAt,
    tier_required: 'tier2', // Default to tier2 features
  };
  
  // Set cookie (in actual implementation, use NextResponse)
  // This is a utility function - actual cookie setting happens in API route
  
  return expiresAt;
}

