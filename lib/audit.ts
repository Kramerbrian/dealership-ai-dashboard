import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuditLogParams {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      tenant_id: params.tenantId,
      user_id: params.userId,
      action: params.action,
      resource: params.resource,
      metadata: params.metadata || {},
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      request_id: params.requestId,
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

// Common audit actions
export const AuditActions = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  DEALERSHIP_CREATED: 'DEALERSHIP_CREATED',
  DEALERSHIP_UPDATED: 'DEALERSHIP_UPDATED',
  DEALERSHIP_DELETED: 'DEALERSHIP_DELETED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  REPORT_DOWNLOADED: 'REPORT_DOWNLOADED',
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELED: 'SUBSCRIPTION_CANCELED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  TENANT_ACCESS_VIOLATION: 'TENANT_ACCESS_VIOLATION',
  PAYMENT_SUCCEEDED: 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;
