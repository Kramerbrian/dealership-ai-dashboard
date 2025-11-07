/**
 * Feedback & Analytics Schema
 * 
 * Defines structure for logging GPT interactions, function calls, and user feedback
 */

export interface InteractionLog {
  interactionId: string;
  userId?: string;
  sessionId?: string;
  userQuery: string;
  botResponse: string;
  promptVersion: string;
  functionCalls: FunctionCallLog[];
  functionResults: FunctionResultLog[];
  context?: {
    retrieval_context?: string[];
    user_location?: string;
    dealership_info?: Record<string, any>;
  };
  userFeedback?: 'good' | 'bad' | 'neutral';
  conversionEvent?: ConversionEvent;
  outcome: 'success' | 'fallback' | 'error';
  errorDetails?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface FunctionCallLog {
  function: string;
  parameters: Record<string, any>;
  timestamp: string;
}

export interface FunctionResultLog {
  function: string;
  result: any;
  success: boolean;
  executionTimeMs?: number;
  error?: string;
}

export interface ConversionEvent {
  type: 'leadSubmitted' | 'testDriveScheduled' | 'appraisalCompleted' | 'inventoryViewed' | 'contactRequested';
  value?: number; // Monetary value if applicable
  vehicleId?: string;
  leadId?: string;
}

/**
 * Create interaction log entry
 */
export function createInteractionLog(data: {
  interactionId: string;
  userQuery: string;
  botResponse: string;
  functionCalls?: Array<{ function: string; parameters: any }>;
  functionResults?: Array<{ function: string; result: any; success: boolean }>;
  userId?: string;
  context?: any;
  userFeedback?: 'good' | 'bad' | 'neutral';
  conversionEvent?: ConversionEvent;
  outcome?: 'success' | 'fallback' | 'error';
}): InteractionLog {
  return {
    interactionId: data.interactionId,
    userId: data.userId,
    userQuery: data.userQuery,
    botResponse: data.botResponse,
    promptVersion: process.env.MODEL_REGISTRY_VERSION || '1.0.0',
    functionCalls: (data.functionCalls || []).map(fc => ({
      function: fc.function,
      parameters: fc.parameters,
      timestamp: new Date().toISOString()
    })),
    functionResults: (data.functionResults || []).map(fr => ({
      function: fr.function,
      result: fr.result,
      success: fr.success,
      timestamp: new Date().toISOString()
    })),
    context: data.context,
    userFeedback: data.userFeedback,
    conversionEvent: data.conversionEvent,
    outcome: data.outcome || 'success',
    timestamp: new Date().toISOString()
  };
}

/**
 * Save interaction log to database
 */
export async function saveInteractionLog(log: InteractionLog): Promise<void> {
  // In production, save to Supabase/Postgres
  // For now, we'll create an API route for this
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dash.dealershipai.com';
    await fetch(`${baseUrl}/api/gpt/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
  } catch (error) {
    console.error('Failed to save interaction log:', error);
    // Fallback: log to console
    console.log('Interaction log:', JSON.stringify(log, null, 2));
  }
}

