/**
 * WorkOS Audit Logs Utilities
 * Create and manage audit log events and schemas
 */

import { workos } from './workos';

export interface AuditLogActor {
  type: 'user' | 'api_key' | 'system';
  id: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogTarget {
  type: string;
  id: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogContext {
  location?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateAuditLogEventOptions {
  organizationId: string;
  action: string;
  occurredAt?: Date;
  version?: number;
  actor: AuditLogActor;
  targets?: AuditLogTarget[];
  context?: AuditLogContext;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface CreateAuditLogSchemaOptions {
  action: string;
  actor?: {
    metadata?: Record<string, string>;
  };
  targets?: Array<{
    type: string;
    metadata?: Record<string, string>;
  }>;
  metadata?: Record<string, string>;
}

/**
 * Create an audit log event
 */
export async function createAuditLogEvent(
  options: CreateAuditLogEventOptions
): Promise<void> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    await workos.auditLogs.createEvent(
      options.organizationId,
      {
        action: options.action,
        occurredAt: options.occurredAt || new Date(),
        version: options.version || 1,
        actor: options.actor,
        targets: options.targets || [],
        context: options.context,
        metadata: options.metadata,
      },
      options.idempotencyKey
        ? {
            idempotencyKey: options.idempotencyKey,
          }
        : undefined
    );
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error creating event:', error);
    throw error;
  }
}

/**
 * Create an audit log schema
 */
export async function createAuditLogSchema(
  options: CreateAuditLogSchemaOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const schema = await workos.auditLogs.createSchema({
      action: options.action,
      actor: options.actor,
      targets: options.targets,
      metadata: options.metadata,
    });

    return schema;
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error creating schema:', error);
    throw error;
  }
}

/**
 * Get audit log schemas for an action
 */
export async function getAuditLogSchemas(action: string): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/audit_logs/actions/${action}/schemas`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch schemas: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error fetching schemas:', error);
    throw error;
  }
}

/**
 * Get all audit log actions
 */
export async function getAuditLogActions(): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch('https://api.workos.com/audit_logs/actions', {
      headers: {
        Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch actions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error fetching actions:', error);
    throw error;
  }
}

/**
 * Create an audit log export
 */
export interface CreateAuditLogExportOptions {
  organizationId: string;
  rangeStart: Date;
  rangeEnd: Date;
  actions?: string[];
  actors?: string[];
  targets?: string[];
}

export async function createAuditLogExport(
  options: CreateAuditLogExportOptions
): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const export_ = await workos.auditLogs.createExport({
      organizationId: options.organizationId,
      rangeStart: options.rangeStart,
      rangeEnd: options.rangeEnd,
      actions: options.actions,
      actors: options.actors,
      targets: options.targets,
    });

    return export_;
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error creating export:', error);
    throw error;
  }
}

/**
 * Get an audit log export by ID
 */
export async function getAuditLogExport(exportId: string): Promise<any> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const export_ = await workos.auditLogs.getExport(exportId);
    return export_;
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error getting export:', error);
    throw error;
  }
}

/**
 * Get audit log retention for an organization
 */
export async function getAuditLogRetention(
  organizationId: string
): Promise<{ retention_period_in_days: number }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/organizations/${organizationId}/audit_logs_retention`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch retention: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error fetching retention:', error);
    throw error;
  }
}

/**
 * Update audit log retention for an organization
 */
export async function updateAuditLogRetention(
  organizationId: string,
  retentionPeriodInDays: number
): Promise<{ retention_period_in_days: number }> {
  if (!workos) {
    throw new Error('WorkOS not configured. WORKOS_API_KEY is required.');
  }

  try {
    const response = await fetch(
      `https://api.workos.com/organizations/${organizationId}/audit_logs_retention`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.WORKOS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          retention_period_in_days: retentionPeriodInDays,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update retention: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[WorkOS Audit Logs] Error updating retention:', error);
    throw error;
  }
}

/**
 * Helper: Log user sign-in event
 */
export async function logUserSignIn(
  organizationId: string,
  userId: string,
  userName: string,
  context?: AuditLogContext
): Promise<void> {
  await createAuditLogEvent({
    organizationId,
    action: 'user.signed_in',
    actor: {
      type: 'user',
      id: userId,
      name: userName,
    },
    targets: [
      {
        type: 'user',
        id: userId,
        name: userName,
      },
    ],
    context,
  });
}

/**
 * Helper: Log user sign-out event
 */
export async function logUserSignOut(
  organizationId: string,
  userId: string,
  userName: string,
  context?: AuditLogContext
): Promise<void> {
  await createAuditLogEvent({
    organizationId,
    action: 'user.signed_out',
    actor: {
      type: 'user',
      id: userId,
      name: userName,
    },
    targets: [
      {
        type: 'user',
        id: userId,
        name: userName,
      },
    ],
    context,
  });
}

