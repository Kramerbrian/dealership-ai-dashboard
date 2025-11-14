/**
 * Pulse Inbox Helper
 * Push agent tiles into pulse:inbox:${tenant} for dashboard consumption
 */

import { redis } from '@/lib/redis';

export interface InboxTile {
  key?: string;
  title: string;
  kpi?: string;
  delta?: string;
  actions?: string[];
  ts?: number;
  severity?: 'low' | 'medium' | 'high';
  category?: string;
}

/**
 * Push an agent tile into the inbox
 * @param tenant - Tenant identifier (namespace or explicit tenant ID)
 * @param tile - Tile data to push
 * @param maxItems - Maximum items to keep in inbox (default: 50)
 */
export async function pushInboxTile(tenant: string, tile: InboxTile, maxItems = 50): Promise<boolean> {
  try {
    const key = `pulse:inbox:${tenant}`;
    // Use Web Crypto API for Edge runtime compatibility
    const generateId = () => {
      if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID().slice(0, 8);
      }
      return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    };
    const tileKey = tile.key || `inbox_${generateId()}`;

    const payload: InboxTile = {
      ...tile,
      key: tileKey,
      ts: tile.ts || Date.now(),
    };

    // Push to left (prepend) so newest items appear first
    await redis.lpush(key, JSON.stringify(payload));

    // Trim to maxItems to prevent unbounded growth
    await redis.ltrim(key, 0, maxItems - 1);

    return true;
  } catch (error) {
    console.error('[pulse/inbox] Failed to push tile:', error);
    return false;
  }
}

/**
 * Push multiple tiles at once
 */
export async function pushInboxTiles(tenant: string, tiles: InboxTile[], maxItems = 50): Promise<number> {
  let successCount = 0;
  for (const tile of tiles) {
    if (await pushInboxTile(tenant, tile, maxItems)) {
      successCount++;
    }
  }
  return successCount;
}

/**
 * Clear all tiles from inbox
 */
export async function clearInbox(tenant: string): Promise<boolean> {
  try {
    const key = `pulse:inbox:${tenant}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('[pulse/inbox] Failed to clear inbox:', error);
    return false;
  }
}

/**
 * Get inbox tile count
 */
export async function getInboxCount(tenant: string): Promise<number> {
  try {
    const key = `pulse:inbox:${tenant}`;
    return (await redis.llen(key)) || 0;
  } catch (error) {
    console.error('[pulse/inbox] Failed to get inbox count:', error);
    return 0;
  }
}

