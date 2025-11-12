/**
 * ============================================================================
 * DealershipAI Orchestrator 3.0 - Function Definitions
 * ============================================================================
 * Tool specifications for OpenAI Assistants API function calling
 * These define what the AI assistant can do autonomously
 * ============================================================================
 */

export const orchestratorFunctions = [
  {
    name: "get_marketpulse_metrics",
    description: "Fetch latest Market Pulse™ KPIs (AIV, ATI, schema health, trust score, etc.) for a dealership. Returns comprehensive visibility and trust metrics.",
    parameters: {
      type: "object",
      properties: {
        dealerId: {
          type: "string",
          description: "Dealer identifier or domain (e.g., 'naplesautogroup.com')"
        },
        mock: {
          type: "boolean",
          description: "Whether to return mock data (default: false)",
          default: false
        }
      },
      required: ["dealerId"]
    }
  },

  {
    name: "run_schema_audit",
    description: "Execute schema health report and return coverage and E-E-A-T scores. Analyzes JSON-LD structured data across all pages.",
    parameters: {
      type: "object",
      properties: {
        dealer: {
          type: "string",
          description: "Optional dealer domain to audit (defaults to main site)"
        }
      }
    }
  },

  {
    name: "deploy_to_vercel",
    description: "Trigger production deployment to Vercel. Use with caution - only after validating build and tests.",
    parameters: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "Git branch to deploy",
          default: "main",
          enum: ["main", "deploy/brand-overlay", "refactor/route-groups"]
        },
        force: {
          type: "boolean",
          description: "Force deployment even with warnings",
          default: false
        }
      },
      required: []
    }
  },

  {
    name: "run_endpoint_audit",
    description: "Test all API endpoints and generate comprehensive health report. Returns pass/fail rates and response times.",
    parameters: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "Base URL to test against (defaults to production)",
          default: "https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
        }
      }
    }
  },

  {
    name: "send_slack_notification",
    description: "Send notification to Slack channel for deployment alerts, health reports, or incidents.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Notification message content"
        },
        type: {
          type: "string",
          description: "Notification type (affects color/icon)",
          enum: ["success", "error", "info", "warning"],
          default: "info"
        },
        channel: {
          type: "string",
          description: "Slack channel to post to",
          default: "#deployments"
        }
      },
      required: ["message"]
    }
  },

  {
    name: "run_build",
    description: "Execute npm build with validation checks. Returns build status and any errors.",
    parameters: {
      type: "object",
      properties: {
        typeCheck: {
          type: "boolean",
          description: "Run TypeScript type checking",
          default: true
        },
        lint: {
          type: "boolean",
          description: "Run ESLint",
          default: true
        }
      }
    }
  },

  {
    name: "analyze_competitor",
    description: "Analyze competitor's AI visibility and structured data. Returns comparison metrics.",
    parameters: {
      type: "object",
      properties: {
        competitorDomain: {
          type: "string",
          description: "Competitor domain to analyze"
        },
        dealerDomain: {
          type: "string",
          description: "Your dealer domain for comparison"
        }
      },
      required: ["competitorDomain", "dealerDomain"]
    }
  },

  {
    name: "generate_schema_markup",
    description: "Generate JSON-LD schema markup for a specific page type (LocalBusiness, Product, Review, etc.).",
    parameters: {
      type: "object",
      properties: {
        schemaType: {
          type: "string",
          description: "Type of schema to generate",
          enum: ["LocalBusiness", "AutoDealer", "Product", "Review", "FAQPage", "Article"]
        },
        data: {
          type: "object",
          description: "Data to populate the schema"
        }
      },
      required: ["schemaType", "data"]
    }
  },

  {
    name: "get_pulse_insights",
    description: "Get real-time Pulse dashboard insights including trends, incidents, and recommendations.",
    parameters: {
      type: "object",
      properties: {
        dealer: {
          type: "string",
          description: "Dealer domain"
        },
        timeRange: {
          type: "string",
          description: "Time range for insights",
          enum: ["24h", "7d", "30d", "90d"],
          default: "7d"
        }
      },
      required: ["dealer"]
    }
  },

  {
    name: "calculate_visibility_roi",
    description: "Calculate ROI from AI visibility improvements. Returns revenue impact estimates.",
    parameters: {
      type: "object",
      properties: {
        currentAIV: {
          type: "number",
          description: "Current AI Visibility Index (0-1)"
        },
        targetAIV: {
          type: "number",
          description: "Target AI Visibility Index (0-1)"
        },
        monthlyTraffic: {
          type: "number",
          description: "Average monthly traffic"
        }
      },
      required: ["currentAIV", "targetAIV", "monthlyTraffic"]
    }
  }
];

/**
 * Export tool definitions in OpenAI Assistants API format
 */
export const openAITools = orchestratorFunctions.map(func => ({
  type: "function",
  function: {
    name: func.name,
    description: func.description,
    parameters: func.parameters
  }
}));

/**
 * Get function definition by name
 */
export function getFunctionByName(name) {
  return orchestratorFunctions.find(f => f.name === name);
}

/**
 * Validate function arguments against schema
 */
export function validateFunctionArgs(functionName, args) {
  const func = getFunctionByName(functionName);
  if (!func) {
    throw new Error(`Unknown function: ${functionName}`);
  }

  // Check required parameters
  const required = func.parameters.required || [];
  for (const param of required) {
    if (!(param in args)) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }

  return true;
}
