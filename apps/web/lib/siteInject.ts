export interface SiteInjectPayload {
  domain: string;
  type: 'json-ld' | 'css' | 'js' | 'meta';
  content: string;
  selector?: string;
  idempotencyKey?: string;
}

export interface SiteInjectResponse {
  success: boolean;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  rollbackId?: string;
}

export async function injectSiteContent(payload: SiteInjectPayload): Promise<SiteInjectResponse> {
  try {
    const response = await fetch('/api/site-inject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        idempotencyKey: payload.idempotencyKey || `inject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    });

    if (!response.ok) {
      throw new Error(`Site injection failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Site injection error:', error);
    throw error;
  }
}

export async function rollbackSiteContent(rollbackId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/site-inject/rollback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollbackId })
    });

    return response.ok;
  } catch (error) {
    console.error('Rollback error:', error);
    return false;
  }
}
