/**
 * WorkOS Organization Domains Utilities
 * Manage organization domain verification
 */

import { workos } from './workos';

/**
 * Get an organization domain by ID
 */
export async function getOrganizationDomain(domainId: string): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const domain = await workos.organizationDomains.get(domainId);
    return domain;
  } catch (error) {
    console.error('[WorkOS Organization Domains] Error getting domain:', error);
    throw error;
  }
}

/**
 * Verify an organization domain
 */
export async function verifyOrganizationDomain(domainId: string): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const domain = await workos.organizationDomains.verify(domainId);
    return domain;
  } catch (error) {
    console.error('[WorkOS Organization Domains] Error verifying domain:', error);
    throw error;
  }
}

