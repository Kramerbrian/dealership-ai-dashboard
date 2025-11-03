/**
 * WorkOS Radar Utilities
 * Fraud detection and risk assessment
 */

import { workos } from './workos';

export interface CreateRadarAttemptOptions {
  ip_address: string;
  user_agent: string;
  email?: string;
  auth_method?: string;
  action?: string;
}

export interface UpdateRadarAttemptOptions {
  attemptId: string;
  attempt_status: 'success' | 'failure';
}

/**
 * Create a radar attempt
 */
export async function createRadarAttempt(
  options: CreateRadarAttemptOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch('https://api.workos.com/radar/attempts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to create radar attempt: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Radar] Error creating attempt:', error);
    throw error;
  }
}

/**
 * Update a radar attempt
 */
export async function updateRadarAttempt(
  options: UpdateRadarAttemptOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/radar/attempts/${options.attemptId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attempt_status: options.attempt_status,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update radar attempt: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Radar] Error updating attempt:', error);
    throw error;
  }
}

/**
 * Add entry to radar block list
 */
export async function addRadarBlockListEntry(
  listType: 'ip_address' | 'email' | 'domain',
  entry: string
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/radar/list/${listType}/block`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to add block list entry: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Radar] Error adding block list entry:', error);
    throw error;
  }
}

/**
 * Remove entry from radar block list
 */
export async function removeRadarBlockListEntry(
  listType: 'ip_address' | 'email' | 'domain',
  entry: string
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/radar/list/${listType}/block`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to remove block list entry: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Radar] Error removing block list entry:', error);
    throw error;
  }
}

