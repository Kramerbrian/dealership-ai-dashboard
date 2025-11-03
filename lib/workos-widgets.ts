/**
 * WorkOS Widgets Utilities
 * Generate tokens for embedded WorkOS widgets
 */

import { workos } from './workos';

export interface GetWidgetTokenOptions {
  organizationId: string;
  userId: string;
  scopes: string[];
}

/**
 * Get a widget token
 */
export async function getWidgetToken(
  options: GetWidgetTokenOptions
): Promise<{ token: string }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const { token } = await workos.widgets.getToken({
      organizationId: options.organizationId,
      userId: options.userId,
      scopes: options.scopes,
    });

    return { token };
  } catch (error) {
    console.error('[WorkOS Widgets] Error getting token:', error);
    throw error;
  }
}

