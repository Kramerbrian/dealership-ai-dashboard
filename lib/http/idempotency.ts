import { redis } from "@/lib/cache";

/**
 * Enforce idempotency using "Idempotency-Key" header per tenant.
 * If a key exists, fail-fast with 409; else set a short TTL.
 */
export async function ensureIdempotent(
  tenantId: string,
  key: string,
  ttlSec = 600
) {
  if (!key) {
    const e: any = new Error("Missing Idempotency-Key header");
    e.status = 400;
    throw e;
  }
  const cacheKey = `idempo:${tenantId}:${key}`;
  if (!redis) return; // if no Redis, best-effort skip
  const exists = await redis.get(cacheKey);
  if (exists) {
    const e: any = new Error("Duplicate request");
    e.status = 409;
    throw e;
  }
  await redis.set(cacheKey, "1", { ex: ttlSec });
}

