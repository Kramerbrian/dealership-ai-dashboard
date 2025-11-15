/**
 * CommerceAction Types
 * Actions that can be executed by the Agentic executor for OEM updates
 */

export type CommerceIntent =
  | 'PUSH_SCHEMA'
  | 'UPDATE_MODEL_COPY'
  | 'UPDATE_MEDIA'
  | 'ALIGN_PRICING'
  | 'RUN_REFRESH';

export type CommerceAction = {
  id: string; // unique
  tenant: string; // dealer id
  intent: CommerceIntent;
  confidence: number; // 0..1
  requires_approval: boolean;
  tool: 'site_inject' | 'auto_fix' | 'queue_refresh';
  input: Record<string, any>;
  preview?: {
    estimate_minutes?: number;
    affected_pages?: number;
  };
};

/**
 * Batch of commerce actions for group-level execution
 */
export type CommerceActionBatch = {
  batch_id: string;
  oem_model_label: string;
  group_id: string;
  group_name: string;
  actions: CommerceAction[];
  created_at: string;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed';
};

