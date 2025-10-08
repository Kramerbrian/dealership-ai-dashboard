// src/lib/cache-manager.ts

import { Redis } from 'ioredis';

export type CacheStrategy = 'always' | 'fallback' | 'pool' | 'bypass';

interface CacheOptions {
  ttl?: number; // seconds
  strategy?: CacheStrategy;
  pool?: string; // for geographic pooling
}

export class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { strategy = 'always', pool } = options;

    // Check direct cache first
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // If pool strategy, check geographic pool
    if (strategy === 'pool' && pool) {
      return this.getFromPool<T>(pool);
    }

    return null;
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const { ttl = 86400, pool } = options; // Default 24h

    const serialized = JSON.stringify(value);
    await this.redis.setex(key, ttl, serialized);

    // Also update pool if specified
    if (pool) {
      await this.updatePool(pool, key, value);
    }
  }

  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Compute
    const value = await computeFn();

    // Cache the result
    await this.set(key, value, options);

    return value;
  }

  private async getFromPool<T>(pool: string): Promise<T | null> {
    const poolKey = `pool:${pool}`;
    const cached = await this.redis.get(poolKey);
    
    if (!cached) return null;

    const poolData = JSON.parse(cached);
    
    // Add variance to pooled data
    return this.addPoolVariance(poolData);
  }

  private async updatePool<T>(pool: string, itemKey: string, value: T): Promise<void> {
    const poolKey = `pool:${pool}`;
    
    // Get current pool data
    const cached = await this.redis.get(poolKey);
    const poolData = cached ? JSON.parse(cached) : { items: [] };

    // Add or update item
    const existingIndex = poolData.items.findIndex((i: any) => i.key === itemKey);
    if (existingIndex >= 0) {
      poolData.items[existingIndex] = { key: itemKey, value };
    } else {
      poolData.items.push({ key: itemKey, value });
    }

    // Recalculate pool average
    poolData.average = this.calculatePoolAverage(poolData.items);
    poolData.updated = Date.now();

    // Cache pool
    await this.redis.setex(poolKey, 86400, JSON.stringify(poolData));
  }

  private calculatePoolAverage(items: Array<{ value: any }>): any {
    if (items.length === 0) return null;

    // Assuming values are score objects
    const sum = items.reduce((acc, item) => {
      const scores = item.value;
      return {
        ai_visibility: (acc.ai_visibility || 0) + (scores.ai_visibility || 0),
        zero_click_shield: (acc.zero_click_shield || 0) + (scores.zero_click_shield || 0),
        ugc_health: (acc.ugc_health || 0) + (scores.ugc_health || 0),
        geo_trust: (acc.geo_trust || 0) + (scores.geo_trust || 0),
        sgp_integrity: (acc.sgp_integrity || 0) + (scores.sgp_integrity || 0),
      };
    }, {
      ai_visibility: 0,
      zero_click_shield: 0,
      ugc_health: 0,
      geo_trust: 0,
      sgp_integrity: 0,
    } as {
      ai_visibility: number;
      zero_click_shield: number;
      ugc_health: number;
      geo_trust: number;
      sgp_integrity: number;
    });

    return {
      ai_visibility: Math.round(sum.ai_visibility / items.length),
      zero_click_shield: Math.round(sum.zero_click_shield / items.length),
      ugc_health: Math.round(sum.ugc_health / items.length),
      geo_trust: Math.round(sum.geo_trust / items.length),
      sgp_integrity: Math.round(sum.sgp_integrity / items.length),
    };
  }

  private addPoolVariance(data: any): any {
    // Add ±3% variance to pooled data
    const variance = (Math.random() - 0.5) * 6;

    return {
      ...data.average,
      ai_visibility: Math.round(data.average.ai_visibility + variance),
      zero_click_shield: Math.round(data.average.zero_click_shield + variance * 0.9),
      ugc_health: Math.round(data.average.ugc_health + variance * 1.1),
      geo_trust: Math.round(data.average.geo_trust + variance * 0.8),
      sgp_integrity: Math.round(data.average.sgp_integrity + variance * 1.2),
    };
  }

  async invalidate(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern);
    if (keys.length === 0) return 0;

    return await this.redis.del(...keys);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export const cacheManager = new CacheManager();
