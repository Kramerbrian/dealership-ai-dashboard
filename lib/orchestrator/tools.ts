/**
 * Orchestrator 3.0 Tool Definitions
 * 
 * These tools are available to Orchestrator 3.0 for gathering signals
 * and executing actions. All tools follow a consistent schema pattern.
 */

export type ToolName =
  | 'clarity_stack'
  | 'schema_health'
  | 'aim_valuation'
  | 'gbp_health'
  | 'ugc_health'
  | 'competitive_summary'
  | 'location_resolve'
  | 'generate_schema_pack'
  | 'queue_refresh'
  | 'site_inject';

export interface ToolDefinition {
  name: ToolName;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  outputSchema: {
    type: 'object';
    properties: Record<string, any>;
  };
  requiresApproval?: boolean;
  readOnly?: boolean;
}

export const ORCHESTRATOR_TOOLS: ToolDefinition[] = [
  {
    name: 'clarity_stack',
    description: 'Get SEO, AEO, GEO, and AVI scores for a domain',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Dealership domain (e.g., naplestoyota.com)',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        seo: { type: 'number' },
        aeo: { type: 'number' },
        geo: { type: 'number' },
        avi: { type: 'number' },
        evidence: {
          type: 'object',
          properties: {
            seo_issues: { type: 'array', items: { type: 'string' } },
            aeo_issues: { type: 'array', items: { type: 'string' } },
            geo_issues: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    readOnly: true,
  },
  {
    name: 'schema_health',
    description: 'Analyze schema coverage and identify missing structured data',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Dealership domain',
        },
        page_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional: filter by page types (VDP, SRP, Service, etc.)',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        coverage: {
          type: 'object',
          properties: {
            AutoDealer: { type: 'number' },
            Vehicle: { type: 'number' },
            LocalBusiness: { type: 'number' },
            FAQPage: { type: 'number' },
            Review: { type: 'number' },
          },
        },
        issues: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
    readOnly: true,
  },
  {
    name: 'aim_valuation',
    description: 'Calculate Revenue at Risk (RaR) and Opportunity Cost Index (OCI)',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
        },
        tenant_id: {
          type: 'string',
          description: 'Optional: dealer/tenant ID for historical data',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        rar_monthly: { type: 'number' },
        rar_annual: { type: 'number' },
        oci_monthly: { type: 'number' },
        assumptions: {
          type: 'object',
          properties: {
            monthly_opportunities: { type: 'number' },
            avg_gross_per_unit: { type: 'number' },
            ai_influence_rate: { type: 'number' },
          },
        },
        breakdown: {
          type: 'object',
          properties: {
            visibility_gap: { type: 'number' },
            conversion_gap: { type: 'number' },
            trust_gap: { type: 'number' },
          },
        },
      },
    },
    readOnly: true,
  },
  {
    name: 'gbp_health',
    description: 'Analyze Google Business Profile health and issues',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
        },
        place_id: {
          type: 'string',
          description: 'Optional: GBP Place ID if known',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        health_score: { type: 'number' },
        rating: { type: 'number' },
        review_count: { type: 'number' },
        photo_count: { type: 'number' },
        photo_freshness_days: { type: 'number' },
        issues: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
    readOnly: true,
  },
  {
    name: 'ugc_health',
    description: 'Analyze User-Generated Content (reviews, ratings, quotes)',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        recent_reviews_90d: { type: 'number' },
        review_velocity_vs_market: { type: 'number' },
        review_usage_on_pages: { type: 'number' },
        issues: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
    readOnly: true,
  },
  {
    name: 'competitive_summary',
    description: 'Get competitive position and leader analysis',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
        },
        city: {
          type: 'string',
          description: 'Optional: city for local market',
        },
        state: {
          type: 'string',
          description: 'Optional: state for local market',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        rank: { type: 'number' },
        total: { type: 'number' },
        avi: { type: 'number' },
        leaders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              domain: { type: 'string' },
              avi: { type: 'number' },
            },
          },
        },
        gap_to_leader: { type: 'number' },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
    readOnly: true,
  },
  {
    name: 'location_resolve',
    description: 'Resolve domain to geographic location',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        city: { type: 'string' },
        state: { type: 'string' },
        zip: { type: 'string' },
        dma: { type: 'string' },
        confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      },
    },
    readOnly: true,
  },
  {
    name: 'generate_schema_pack',
    description: 'Generate JSON-LD schema for a set of pages',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
        },
        page_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'VDP, SRP, Service, etc.',
        },
        count: {
          type: 'number',
          description: 'Number of pages to generate schema for',
        },
        dry_run: {
          type: 'boolean',
          description: 'If true, return schema without deploying',
          default: true,
        },
      },
      required: ['domain', 'page_types'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['success', 'error'] },
        pages_processed: { type: 'number' },
        schema_generated: { type: 'number' },
        dry_run: { type: 'boolean' },
        preview: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              schema_type: { type: 'string' },
              snippet: { type: 'string' },
            },
          },
        },
      },
    },
    requiresApproval: true,
  },
  {
    name: 'queue_refresh',
    description: 'Queue a refresh scan for a domain',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
        },
        priority: {
          type: 'string',
          enum: ['low', 'normal', 'high'],
          default: 'normal',
        },
      },
      required: ['domain'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        job_id: { type: 'string' },
        estimated_completion: { type: 'string' },
      },
    },
  },
  {
    name: 'site_inject',
    description: 'Inject HTML/JSON-LD into target pages',
    inputSchema: {
      type: 'object',
      properties: {
        hosts: {
          type: 'array',
          items: { type: 'string' },
          description: 'URLs or domains to inject into',
        },
        head_html: {
          type: 'string',
          description: 'HTML to inject in <head>',
        },
        footer_html: {
          type: 'string',
          description: 'Optional: HTML to inject before </body>',
        },
        dry_run: {
          type: 'boolean',
          default: true,
        },
      },
      required: ['hosts', 'head_html'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['success', 'error'] },
        pages_updated: { type: 'number' },
        version_id: { type: 'string' },
        rollback_url: { type: 'string' },
        dry_run: { type: 'boolean' },
      },
    },
    requiresApproval: true,
  },
];

/**
 * Get tool definition by name
 */
export function getTool(name: ToolName): ToolDefinition | undefined {
  return ORCHESTRATOR_TOOLS.find((t) => t.name === name);
}

/**
 * Get all read-only tools
 */
export function getReadOnlyTools(): ToolDefinition[] {
  return ORCHESTRATOR_TOOLS.filter((t) => t.readOnly === true);
}

/**
 * Get all tools that require approval
 */
export function getApprovalRequiredTools(): ToolDefinition[] {
  return ORCHESTRATOR_TOOLS.filter((t) => t.requiresApproval === true);
}

/**
 * Convert tool definitions to OpenAI function calling format
 */
export function toOpenAIFunctions(): Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}> {
  return ORCHESTRATOR_TOOLS.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

