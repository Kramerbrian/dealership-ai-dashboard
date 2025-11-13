import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface IdempotencyCheck {
  cached: boolean;
  response?: any;
  statusCode?: number;
}

export async function checkIdempotencyKey(
  key: string,
  tenantId: string
): Promise<IdempotencyCheck> {
  try {
    const { data, error } = await supabase
      .from('idempotency_keys')
      .select('response, status_code')
      .eq('key', key)
      .eq('tenant_id', tenantId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return { cached: false };

    return {
      cached: true,
      response: data.response,
      statusCode: data.status_code,
    };
  } catch (error) {
    console.error('Failed to check idempotency key:', error);
    return { cached: false };
  }
}

export async function storeIdempotencyKey(
  key: string,
  tenantId: string,
  endpoint: string,
  response: any,
  statusCode: number
): Promise<void> {
  try {
    await supabase.from('idempotency_keys').insert({
      key,
      tenant_id: tenantId,
      endpoint,
      response,
      status_code: statusCode,
    });
  } catch (error) {
    console.error('Failed to store idempotency key:', error);
  }
}

export function getStripeIdempotencyKey(event: any): string {
  return `stripe_${event.id}_${event.type}`;
}

export function getClerkIdempotencyKey(event: any): string {
  return `clerk_${event.data.id}_${event.type}`;
}
