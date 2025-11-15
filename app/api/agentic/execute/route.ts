/**
 * Agentic Execute Endpoint
 * Executes a batch of CommerceActions for group-level OEM updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommerceAction, CommerceActionBatch } from '@/models/CommerceAction';
import { canAccessAPIsAndAgents } from '@/lib/rbac';
import { requireRBAC } from '@/lib/rbac';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const executeBatchSchema = z.object({
  batch_id: z.string(),
  actions: z.array(
    z.object({
      id: z.string(),
      tenant: z.string(),
      intent: z.enum(['PUSH_SCHEMA', 'UPDATE_MODEL_COPY', 'UPDATE_MEDIA', 'ALIGN_PRICING', 'RUN_REFRESH']),
      confidence: z.number().min(0).max(1),
      requires_approval: z.boolean(),
      tool: z.enum(['site_inject', 'auto_fix', 'queue_refresh']),
      input: z.record(z.any()),
      preview: z
        .object({
          estimate_minutes: z.number().optional(),
          affected_pages: z.number().optional(),
        })
        .optional(),
    })
  ),
});

/**
 * POST /api/agentic/execute
 * Execute a batch of CommerceActions
 * Requires marketing_director+ role
 */
export async function POST(req: NextRequest) {
  try {
    // Check RBAC - requires marketing_director or higher
    const rbac = await requireRBAC(req, ['marketing_director', 'admin', 'superadmin']);
    if (rbac instanceof NextResponse) return rbac;

    // Verify role has access to APIs & Agents
    if (!canAccessAPIsAndAgents(rbac.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const validated = executeBatchSchema.parse(body);

    // Separate actions by approval requirement
    const requiresApproval = validated.actions.filter((a) => a.requires_approval);
    const autoExecute = validated.actions.filter((a) => !a.requires_approval);

    const results = [];

    // Execute auto-approved actions immediately
    for (const action of autoExecute) {
      try {
        const result = await executeCommerceAction(action);
        results.push({ action_id: action.id, status: 'executed', result });
      } catch (error: any) {
        results.push({ action_id: action.id, status: 'failed', error: error.message });
      }
    }

    // Queue actions requiring approval
    const approvalQueue = [];
    for (const action of requiresApproval) {
      const queued = await queueForApproval(action, rbac.userId);
      approvalQueue.push(queued);
    }

    return NextResponse.json({
      success: true,
      batch_id: validated.batch_id,
      executed: results.length,
      queued_for_approval: approvalQueue.length,
      results,
      approval_queue: approvalQueue,
    });
  } catch (error: any) {
    console.error('[agentic/execute] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to execute actions', message: error.message }, { status: 500 });
  }
}

/**
 * Execute a single CommerceAction
 */
async function executeCommerceAction(action: CommerceAction): Promise<any> {
  // Route to appropriate tool based on action.tool
  switch (action.tool) {
    case 'site_inject':
      // Call site inject API
      return await executeSiteInject(action);
    case 'auto_fix':
      // Call auto-fix API
      return await executeAutoFix(action);
    case 'queue_refresh':
      // Queue refresh job
      return await queueRefresh(action);
    default:
      throw new Error(`Unknown tool: ${action.tool}`);
  }
}

async function executeSiteInject(action: CommerceAction): Promise<any> {
  // TODO: Call your site_inject API
  console.log('[executeSiteInject]', action);
  return { success: true, action_id: action.id };
}

async function executeAutoFix(action: CommerceAction): Promise<any> {
  // TODO: Call your auto_fix API
  console.log('[executeAutoFix]', action);
  return { success: true, action_id: action.id };
}

async function queueRefresh(action: CommerceAction): Promise<any> {
  // TODO: Queue refresh job
  console.log('[queueRefresh]', action);
  return { success: true, action_id: action.id, queued: true };
}

async function queueForApproval(action: CommerceAction, userId: string): Promise<any> {
  // TODO: Save to approval queue (database)
  console.log('[queueForApproval]', action, userId);
  return {
    action_id: action.id,
    status: 'pending_approval',
    queued_at: new Date().toISOString(),
  };
}

