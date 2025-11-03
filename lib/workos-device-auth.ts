/**
 * WorkOS Device Authorization Utilities
 * OAuth 2.0 Device Authorization Grant (RFC 8628)
 */

import { workos } from './workos';

export interface DeviceAuthorizationOptions {
  clientId: string;
  scope?: string;
}

export interface DeviceAuthorizationResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval?: number;
}

/**
 * Request device authorization
 */
export async function requestDeviceAuthorization(
  options: DeviceAuthorizationOptions
): Promise<DeviceAuthorizationResponse> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    // Note: WorkOS SDK might not have direct device auth support
    // Using direct API call for now
    const response = await fetch(
      `${process.env.WORKOS_AUTHKIT_DOMAIN || 'https://api.workos.com'}/oauth2/device_authorization`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: options.clientId,
          ...(options.scope && { scope: options.scope }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Device authorization failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Device Auth] Error:', error);
    throw error;
  }
}

/**
 * Poll for device access token
 */
export interface DeviceTokenOptions {
  deviceCode: string;
  clientId: string;
}

export async function pollDeviceToken(
  options: DeviceTokenOptions
): Promise<{
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
}> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `${process.env.WORKOS_AUTHKIT_DOMAIN || 'https://api.workos.com'}/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: options.deviceCode,
          client_id: options.clientId,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Device Auth] Error polling:', error);
    throw error;
  }
}

