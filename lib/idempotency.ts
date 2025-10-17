import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface IdempotencyOptions {
  key: string;
  tenantId: string;
  route: string;
  ttl?: number; // Time to live in seconds, default 24 hours
}

export class IdempotencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdempotencyError';
  }
}

/**
 * Generate a unique idempotency key from request data
 */
export function generateIdempotencyKey(
  tenantId: string,
  route: string,
  key: string
): string {
  const data = `${tenantId}:${route}:${key}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Check if a request is idempotent and store the key if not seen
 */
export async function checkIdempotency(
  options: IdempotencyOptions
): Promise<{ isDuplicate: boolean; key: string }> {
  const { key, tenantId, route, ttl = 86400 } = options;
  const idempotencyKey = generateIdempotencyKey(tenantId, route, key);
  
  try {
    // Check if key already exists
    const existing = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id FROM idempotency_keys WHERE id = $1 AND seen_at > now() - interval \'24 hours\'',
      idempotencyKey
    );
    
    if (existing.length > 0) {
      return { isDuplicate: true, key: idempotencyKey };
    }
    
    // Store the key
    await prisma.$executeRawUnsafe(
      'INSERT INTO idempotency_keys (id, tenant_id, route, key, seen_at) VALUES ($1, $2, $3, $4, now()) ON CONFLICT (id) DO NOTHING',
      idempotencyKey,
      tenantId,
      route,
      key
    );
    
    return { isDuplicate: false, key: idempotencyKey };
  } catch (error) {
    console.error('Idempotency check failed:', error);
    // If database is unavailable, allow the request to proceed
    return { isDuplicate: false, key: idempotencyKey };
  }
}

/**
 * Middleware wrapper for idempotency checking
 */
export function withIdempotency(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    keyExtractor: (req: NextRequest) => string;
    tenantIdExtractor: (req: NextRequest) => string;
    route: string;
  }
) {
  return async (req: NextRequest, context: any): Promise<NextResponse> => {
    try {
      const key = options.keyExtractor(req);
      const tenantId = options.tenantIdExtractor(req);
      
      const { isDuplicate } = await checkIdempotency({
        key,
        tenantId,
        route: options.route,
      });
      
      if (isDuplicate) {
        return NextResponse.json(
          { error: 'Duplicate request detected', code: 'DUPLICATE_REQUEST' },
          { status: 409 }
        );
      }
      
      return handler(req, context);
    } catch (error) {
      console.error('Idempotency middleware error:', error);
      // If idempotency check fails, proceed with the request
      return handler(req, context);
    }
  };
}

/**
 * Clean up old idempotency keys
 */
export async function cleanupIdempotencyKeys(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      'DELETE FROM idempotency_keys WHERE seen_at < now() - interval \'24 hours\''
    );
  } catch (error) {
    console.error('Failed to cleanup idempotency keys:', error);
  }
}