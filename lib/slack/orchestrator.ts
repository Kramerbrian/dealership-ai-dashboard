/**
 * Orchestrator API Client
 * Helper functions for calling orchestrator endpoints
 */

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';

export interface OrchestratorTask {
  type: string;
  payload: Record<string, any>;
  source?: string;
  userId?: string;
  userName?: string;
}

export interface OrchestratorResponse {
  taskId?: string;
  id?: string;
  status: string;
  message?: string;
}

/**
 * Call orchestrator to queue a task
 * @param task - Task definition
 * @returns Response from orchestrator
 */
export async function queueOrchestratorTask(
  task: OrchestratorTask
): Promise<OrchestratorResponse | null> {
  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/api/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.ORCHESTRATOR_AUTH_TOKEN && {
          Authorization: `Bearer ${process.env.ORCHESTRATOR_AUTH_TOKEN}`,
        }),
      },
      body: JSON.stringify(task),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Orchestrator error:', errorText);
      return null;
    }

    const data = await response.json() as OrchestratorResponse;
    return data;
  } catch (error) {
    console.error('Error calling orchestrator:', error);
    return null;
  }
}

/**
 * Get task status from orchestrator
 * @param taskId - Task ID
 * @returns Task status
 */
export async function getOrchestratorTaskStatus(taskId: string): Promise<any | null> {
  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/api/orchestrate/${taskId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.ORCHESTRATOR_AUTH_TOKEN && {
          Authorization: `Bearer ${process.env.ORCHESTRATOR_AUTH_TOKEN}`,
        }),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting task status:', error);
    return null;
  }
}
