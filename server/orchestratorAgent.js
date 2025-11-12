/**
 * ============================================================================
 * DealershipAI Orchestrator 3.0 - Agent Runtime
 * ============================================================================
 * OpenAI Assistants API integration with function calling
 * Handles autonomous operations: metrics, audits, deployments, monitoring
 * ============================================================================
 */

import OpenAI from "openai";
import { orchestratorFunctions, validateFunctionArgs } from "../functions/orchestratorTools.js";
import { exec } from "child_process";
import { promisify } from "util";
import fetch from "node-fetch";

const execAsync = promisify(exec);
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Run the orchestrator assistant with function calling
 */
export async function runAssistant(input, options = {}) {
  const {
    model = "gpt-4-turbo",
    maxTokens = 4000,
    temperature = 0.3,
    conversationHistory = []
  } = options;

  const messages = [
    ...conversationHistory,
    { role: "user", content: input }
  ];

  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      functions: orchestratorFunctions,
      function_call: "auto",
      max_tokens: maxTokens,
      temperature
    });

    const msg = completion.choices[0].message;

    // Handle function call
    if (msg.function_call) {
      const { name, arguments: argsStr } = msg.function_call;
      const args = JSON.parse(argsStr);

      // Validate arguments
      validateFunctionArgs(name, args);

      // Execute function
      const result = await executeFunction(name, args);

      // Return both the function call and result
      return {
        type: "function_call",
        function: name,
        arguments: args,
        result,
        message: msg.content || `Executed ${name}`
      };
    }

    // Return text response
    return {
      type: "text",
      message: msg.content,
      usage: completion.usage
    };
  } catch (error) {
    console.error("[orchestratorAgent] Error:", error);
    throw error;
  }
}

/**
 * Execute a function by name
 */
async function executeFunction(name, args) {
  console.log(`[orchestratorAgent] Executing ${name} with args:`, args);

  switch (name) {
    case "get_marketpulse_metrics":
      return getMarketPulseMetrics(args);

    case "run_schema_audit":
      return runSchemaAudit(args);

    case "deploy_to_vercel":
      return deployToVercel(args);

    case "run_endpoint_audit":
      return runEndpointAudit(args);

    case "send_slack_notification":
      return sendSlackNotification(args);

    case "run_build":
      return runBuild(args);

    case "analyze_competitor":
      return analyzeCompetitor(args);

    case "generate_schema_markup":
      return generateSchemaMarkup(args);

    case "get_pulse_insights":
      return getPulseInsights(args);

    case "calculate_visibility_roi":
      return calculateVisibilityROI(args);

    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

// ============================================================================
// Function Implementations
// ============================================================================

/**
 * Fetch MarketPulse metrics for a dealer
 */
async function getMarketPulseMetrics({ dealerId, mock = false }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/marketpulse/compute?dealer=${encodeURIComponent(dealerId)}&mock=${mock}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`MarketPulse API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Run schema health audit
 */
async function runSchemaAudit({ dealer }) {
  try {
    const { stdout, stderr } = await execAsync("node scripts/schema-health-report.js");

    // Parse output for metrics
    const schemaCoverage = extractMetric(stdout, /Schema Coverage:\s*([0-9.]+)/);
    const eeatScore = extractMetric(stdout, /E-E-A-T Score:\s*([0-9.]+)/);

    return {
      success: true,
      dealer: dealer || "main",
      schemaCoverage,
      eeatScore,
      output: stdout,
      errors: stderr || null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr
    };
  }
}

/**
 * Deploy to Vercel production
 */
async function deployToVercel({ branch = "main", force = false }) {
  try {
    // Switch to branch if needed
    if (branch !== "main") {
      await execAsync(`git checkout ${branch}`);
    }

    // Run deployment
    const cmd = force ? "npx vercel --prod --yes --force" : "npx vercel --prod --yes";
    const { stdout, stderr } = await execAsync(cmd, { timeout: 180000 });

    // Extract deployment URL
    const deploymentUrl = extractDeploymentUrl(stdout);

    return {
      success: true,
      branch,
      deploymentUrl,
      output: stdout,
      warnings: stderr || null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr
    };
  }
}

/**
 * Run endpoint audit
 */
async function runEndpointAudit({ baseUrl }) {
  try {
    const env = baseUrl ? `NEXT_PUBLIC_APP_URL=${baseUrl}` : "";
    const { stdout } = await execAsync(`${env} node scripts/audit-all-endpoints.js`, {
      timeout: 60000
    });

    // Parse audit results
    const totalMatch = stdout.match(/Total Endpoints:\s*(\d+)/);
    const passedMatch = stdout.match(/✓ Passed:\s*(\d+)/);
    const failedMatch = stdout.match(/✗ Failed:\s*(\d+)/);

    return {
      success: true,
      baseUrl: baseUrl || "production",
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      output: stdout
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send Slack notification
 */
async function sendSlackNotification({ message, type = "info", channel = "#deployments" }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      success: false,
      error: "SLACK_WEBHOOK_URL not configured"
    };
  }

  const colors = {
    success: "good",
    error: "danger",
    warning: "warning",
    info: "#0088FF"
  };

  const payload = {
    channel,
    attachments: [{
      color: colors[type] || colors.info,
      text: message,
      footer: "DealershipAI Orchestrator 3.0",
      ts: Math.floor(Date.now() / 1000)
    }]
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return {
      success: res.ok,
      status: res.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run build with validation
 */
async function runBuild({ typeCheck = true, lint = true }) {
  try {
    const results = {};

    // TypeScript check
    if (typeCheck) {
      try {
        const { stdout, stderr } = await execAsync("npx tsc --noEmit");
        results.typeCheck = { success: true, output: stdout };
      } catch (error) {
        results.typeCheck = { success: false, errors: error.stderr };
      }
    }

    // Linting
    if (lint) {
      try {
        const { stdout, stderr } = await execAsync("npm run lint");
        results.lint = { success: true, output: stdout };
      } catch (error) {
        results.lint = { success: false, errors: error.stderr };
      }
    }

    // Build
    const { stdout, stderr } = await execAsync("npm run build", { timeout: 120000 });
    results.build = { success: true, output: stdout, warnings: stderr };

    return {
      success: true,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr
    };
  }
}

/**
 * Analyze competitor
 */
async function analyzeCompetitor({ competitorDomain, dealerDomain }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/competitors/intelligence?competitor=${encodeURIComponent(competitorDomain)}&dealer=${encodeURIComponent(dealerDomain)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Competitor API error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate schema markup
 */
async function generateSchemaMarkup({ schemaType, data }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/actions/generate-schema`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemaType, data })
    });

    if (!res.ok) {
      throw new Error(`Schema generation error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Pulse insights
 */
async function getPulseInsights({ dealer, timeRange = "7d" }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/pulse/insights?dealer=${encodeURIComponent(dealer)}&timeRange=${timeRange}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Pulse API error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate visibility ROI
 */
async function calculateVisibilityROI({ currentAIV, targetAIV, monthlyTraffic }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/visibility-roi`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentAIV, targetAIV, monthlyTraffic })
    });

    if (!res.ok) {
      throw new Error(`ROI API error: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// Utilities
// ============================================================================

function extractMetric(text, regex) {
  const match = text.match(regex);
  return match ? parseFloat(match[1]) : null;
}

function extractDeploymentUrl(text) {
  const match = text.match(/https:\/\/[^\s]+vercel\.app/);
  return match ? match[0] : null;
}

export default { runAssistant, executeFunction };
