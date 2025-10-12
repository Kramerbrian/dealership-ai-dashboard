// GPT Action Mappings for DealershipAI
// Maps GPT function calls to API endpoints

export interface GPTAction {
  name: string;
  description: string;
  parameters: any;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export const GPT_ACTIONS: GPTAction[] = [
  // AVI Report Actions
  {
    name: 'get_latest_avi',
    description: 'Get the latest AVI report for a tenant',
    parameters: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'string',
          description: 'The tenant ID (UUID format)'
        }
      },
      required: ['tenantId']
    },
    endpoint: '/api/tenants/{tenantId}/avi/latest',
    method: 'GET'
  },
  {
    name: 'get_avi_history',
    description: 'Get AVI report history for a tenant',
    parameters: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'string',
          description: 'The tenant ID (UUID format)'
        },
        limit: {
          type: 'number',
          description: 'Number of records to return (1-100)',
          default: 8
        },
        before: {
          type: 'string',
          description: 'Cursor for pagination (date string)',
          optional: true
        }
      },
      required: ['tenantId']
    },
    endpoint: '/api/tenants/{tenantId}/avi/history',
    method: 'GET'
  },
  
  // Existing KPI Actions (maintained)
  {
    name: 'get_aiv_metrics',
    description: 'Get current AIV metrics for a dealer',
    parameters: {
      type: 'object',
      properties: {
        dealerId: {
          type: 'string',
          description: 'The dealer ID'
        }
      },
      required: ['dealerId']
    },
    endpoint: '/api/aiv-metrics',
    method: 'GET'
  },
  {
    name: 'recompute_elasticity',
    description: 'Recompute elasticity for a dealer',
    parameters: {
      type: 'object',
      properties: {
        dealerId: {
          type: 'string',
          description: 'The dealer ID'
        }
      },
      required: ['dealerId']
    },
    endpoint: '/api/elasticity/recompute',
    method: 'POST'
  },
  {
    name: 'process_gpt_query',
    description: 'Process a general query through GPT proxy',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The query prompt'
        },
        dealerId: {
          type: 'string',
          description: 'Optional dealer context',
          optional: true
        }
      },
      required: ['prompt']
    },
    endpoint: '/api/gpt-proxy',
    method: 'POST'
  }
];

// Helper function to resolve action endpoint
export function resolveActionEndpoint(actionName: string, params: Record<string, any>): string {
  const action = GPT_ACTIONS.find(a => a.name === actionName);
  if (!action) {
    throw new Error(`Unknown action: ${actionName}`);
  }

  let endpoint = action.endpoint;
  
  // Replace path parameters
  Object.entries(params).forEach(([key, value]) => {
    endpoint = endpoint.replace(`{${key}}`, encodeURIComponent(value));
  });

  return endpoint;
}

// Helper function to get action by name
export function getAction(actionName: string): GPTAction | undefined {
  return GPT_ACTIONS.find(a => a.name === actionName);
}

// Helper function to validate action parameters
export function validateActionParameters(actionName: string, params: Record<string, any>): boolean {
  const action = getAction(actionName);
  if (!action) return false;

  const required = action.parameters.required || [];
  return required.every(param => param in params);
}
