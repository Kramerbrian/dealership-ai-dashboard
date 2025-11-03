/**
 * WorkOS Portal Utilities
 * Generate portal links for SSO configuration and user management
 */

import { workos } from './workos';

export interface PortalLinkOptions {
  organization: string;
  intent: 'sso' | 'dsync' | 'audit_logs' | 'log_streams' | 'user_management';
  returnUrl?: string;
  expiresIn?: number; // seconds
}

/**
 * Generate a portal link for an organization
 */
export async function generatePortalLink(options: PortalLinkOptions): Promise<string> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const { link } = await workos.portal.generateLink({
      organization: options.organization,
      intent: options.intent,
      returnUrl: options.returnUrl,
      expiresIn: options.expiresIn,
    });

    return link;
  } catch (error) {
    console.error('[WorkOS Portal] Error generating link:', error);
    throw error;
  }
}

/**
 * Generate SSO portal link
 */
export async function generateSSOPortalLink(
  organizationId: string,
  returnUrl?: string
): Promise<string> {
  return generatePortalLink({
    organization: organizationId,
    intent: 'sso',
    returnUrl,
  });
}

/**
 * Generate Directory Sync portal link
 */
export async function generateDirectorySyncPortalLink(
  organizationId: string,
  returnUrl?: string
): Promise<string> {
  return generatePortalLink({
    organization: organizationId,
    intent: 'dsync',
    returnUrl,
  });
}

/**
 * Generate Audit Logs portal link
 */
export async function generateAuditLogsPortalLink(
  organizationId: string,
  returnUrl?: string
): Promise<string> {
  return generatePortalLink({
    organization: organizationId,
    intent: 'audit_logs',
    returnUrl,
  });
}

