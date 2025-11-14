/**
 * Brand-Aware Routing
 * Routes OEM updates to correct dealer rooftops based on brand affiliation
 */

import { redis } from '@/lib/redis';

export interface DealerBrandMapping {
  tenant: string; // e.g., "toyota-naples", "hyundai-fort-myers"
  brands: string[]; // e.g., ["Toyota"], ["Hyundai", "Genesis"]
  models?: string[]; // Optional: specific models they stock (e.g., ["Tacoma", "4Runner"])
  city?: string;
  state?: string;
}

/**
 * Get all tenants (dealers) that match a given brand
 * In production, this would query your database
 * For now, we'll use Redis to cache brand mappings
 */
export async function getTenantsByBrand(brand: string): Promise<string[]> {
  try {
    // Check Redis cache first
    const cacheKey = `oem:brand:${brand.toLowerCase()}:tenants`;
    const cached = await redis.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // TODO: Replace with actual database query
    // For now, return empty array - you'll need to implement this based on your schema
    // Example query (if using Prisma):
    // const dealers = await prisma.dealer.findMany({
    //   where: { brands: { has: brand } },
    //   select: { id: true, domain: true }
    // });
    // return dealers.map(d => d.domain.replace(/\./g, '-') || d.id);

    // Fallback: return empty array
    return [];
  } catch (error) {
    console.error(`[oem/brand-routing] Failed to get tenants for brand ${brand}:`, error);
    return [];
  }
}

/**
 * Get tenants that stock a specific model
 */
export async function getTenantsByModel(brand: string, model: string): Promise<string[]> {
  try {
    // Check Redis cache
    const cacheKey = `oem:brand:${brand.toLowerCase()}:model:${model.toLowerCase()}:tenants`;
    const cached = await redis.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // TODO: Replace with actual database query
    // Example (if you track inventory):
    // const dealers = await prisma.dealer.findMany({
    //   where: {
    //     brands: { has: brand },
    //     inventory: { some: { model: { equals: model, mode: 'insensitive' } } }
    //   },
    //   select: { id: true, domain: true }
    // });
    // return dealers.map(d => d.domain.replace(/\./g, '-') || d.id);

    return [];
  } catch (error) {
    console.error(`[oem/brand-routing] Failed to get tenants for model ${brand} ${model}:`, error);
    return [];
  }
}

/**
 * Route OEM update to appropriate tenants
 * @param brand - OEM brand (e.g., "Toyota")
 * @param model - Model name (e.g., "Tacoma")
 * @param filterByModel - If true, only route to dealers that stock this model
 */
export async function routeOEMUpdateToTenants(
  brand: string,
  model?: string,
  filterByModel = false
): Promise<string[]> {
  if (filterByModel && model) {
    return getTenantsByModel(brand, model);
  }
  return getTenantsByBrand(brand);
}

/**
 * Cache brand-to-tenant mappings (call this periodically or on dealer updates)
 */
export async function refreshBrandMappings(): Promise<void> {
  try {
    // TODO: Query your database for all dealer-brand mappings
    // Example:
    // const dealers = await prisma.dealer.findMany({
    //   select: { id: true, domain: true, brands: true }
    // });
    //
    // for (const dealer of dealers) {
    //   const tenant = dealer.domain.replace(/\./g, '-') || dealer.id;
    //   for (const brand of dealer.brands) {
    //     const key = `oem:brand:${brand.toLowerCase()}:tenants`;
    //     await redis.sadd(key, tenant);
    //     await redis.expire(key, 60 * 60 * 24); // 24h TTL
    //   }
    // }
  } catch (error) {
    console.error('[oem/brand-routing] Failed to refresh brand mappings:', error);
  }
}

