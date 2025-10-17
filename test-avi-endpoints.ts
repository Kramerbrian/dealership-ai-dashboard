// Smoke tests for AVI endpoints
import { describe, it, expect } from '@jest/globals';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('AVI API Endpoints', () => {
  it('should return latest AVI data', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/${TEST_TENANT_ID}/avi/latest`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('aiv_pct');
    expect(data.data).toHaveProperty('ati_pct');
    expect(data.data).toHaveProperty('crs_pct');
  });

  it('should return AVI history', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/${TEST_TENANT_ID}/avi/history`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should return drivers data', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/${TEST_TENANT_ID}/avi/drivers`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should return anomalies data', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/${TEST_TENANT_ID}/avi/anomalies`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should return backlog data', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/${TEST_TENANT_ID}/avi/backlog`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should return model data', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/${TEST_TENANT_ID}/avi/model`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  it('should handle invalid tenant ID', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/invalid-uuid/avi/latest`);
    expect(response.status).toBe(400);
  });

  it('should return proper CORS headers', async () => {
    const response = await fetch(`${BASE_URL}/api/tenants/${TEST_TENANT_ID}/avi/latest`);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });
});

// Observability hooks
export const useAviObservability = () => {
  const trackAviLoad = (tenantId: string, loadTime: number) => {
    // Track AVI data load performance
    console.log(`AVI load for tenant ${tenantId}: ${loadTime}ms`);
  };

  const trackAviError = (tenantId: string, error: Error) => {
    // Track AVI errors
    console.error(`AVI error for tenant ${tenantId}:`, error);
  };

  const trackAviInteraction = (tenantId: string, action: string) => {
    // Track user interactions with AVI data
    console.log(`AVI interaction for tenant ${tenantId}: ${action}`);
  };

  return { trackAviLoad, trackAviError, trackAviInteraction };
};
