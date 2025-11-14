/**
 * Pulse Agent Builder
 * Generates and versions Agentic GPT configurations dynamically
 *
 * Use this tool to generate and version future Agentic GPT configs
 * based on the canonical baseline.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import agentConfig from './dai-agent-canonical.json';
import commerceConfig from './dai-orchestrator-agentic-commerce.json';

export interface AgentBuildOptions {
  outputDir?: string;
  version?: string;
  includeHashes?: boolean;
  prettify?: boolean;
}

export interface AgentBuildResult {
  success: boolean;
  files: Array<{
    path: string;
    hash: string;
    size: number;
  }>;
  version: string;
  timestamp: string;
}

/**
 * Build Pulse Agent configuration
 */
export async function buildPulseAgent(
  options: AgentBuildOptions = {}
): Promise<AgentBuildResult> {
  const {
    outputDir = path.join(process.cwd(), 'canonical/agentic'),
    version = new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    includeHashes = true,
    prettify = true,
  } = options;

  console.log('🤖 Building Pulse Agent configuration...');
  console.log(`   Version: ${version}`);
  console.log(`   Output: ${outputDir}`);

  const files: AgentBuildResult['files'] = [];

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Update version in configs
  const updatedAgentConfig = {
    ...agentConfig,
    version,
    metadata: {
      ...agentConfig.metadata,
      updated: new Date().toISOString(),
    },
  };

  const updatedCommerceConfig = {
    ...commerceConfig,
    version,
    metadata: {
      ...commerceConfig.metadata,
      updated: new Date().toISOString(),
    },
  };

  // Write updated configs
  const agentPath = path.join(outputDir, 'dai-agent-canonical.json');
  const commercePath = path.join(outputDir, 'dai-orchestrator-agentic-commerce.json');

  const agentContent = JSON.stringify(updatedAgentConfig, null, prettify ? 2 : 0);
  const commerceContent = JSON.stringify(updatedCommerceConfig, null, prettify ? 2 : 0);

  fs.writeFileSync(agentPath, agentContent);
  fs.writeFileSync(commercePath, commerceContent);

  // Calculate hashes if requested
  if (includeHashes) {
    files.push({
      path: agentPath,
      hash: `sha256:${createHash('sha256').update(agentContent).digest('hex')}`,
      size: agentContent.length,
    });

    files.push({
      path: commercePath,
      hash: `sha256:${createHash('sha256').update(commerceContent).digest('hex')}`,
      size: commerceContent.length,
    });
  }

  console.log('✅ Pulse Agent configuration built successfully');
  console.log(`   Files: ${files.length}`);

  return {
    success: true,
    files,
    version,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate Pulse Agent configuration
 */
export function validatePulseAgent(): boolean {
  console.log('🔍 Validating Pulse Agent configuration...');

  // Validate agent config structure
  const requiredAgentFields = ['agent', 'capabilities', 'scoring_framework', 'orchestration'];
  for (const field of requiredAgentFields) {
    if (!(field in agentConfig)) {
      console.error(`❌ Missing required field in agent config: ${field}`);
      return false;
    }
  }

  // Validate commerce config structure
  const requiredCommerceFields = ['orchestrator', 'economics', 'intelligence_sources'];
  for (const field of requiredCommerceFields) {
    if (!(field in commerceConfig)) {
      console.error(`❌ Missing required field in commerce config: ${field}`);
      return false;
    }
  }

  console.log('✅ Pulse Agent configuration is valid');
  return true;
}

/**
 * Generate agent summary report
 */
export function generateAgentReport(): string {
  const report = `
# DealershipAI Agentic Intelligence Agent Report

## Agent Configuration
- **ID**: ${agentConfig.agent.id}
- **Name**: ${agentConfig.agent.name}
- **Model**: ${agentConfig.agent.model}
- **Version**: ${agentConfig.version}

## Capabilities
${agentConfig.capabilities.map(cap => `- **${cap.name}**: ${cap.description}`).join('\n')}

## Commerce Orchestrator
- **Name**: ${commerceConfig.orchestrator.name}
- **Mode**: ${commerceConfig.orchestrator.mode}
- **Profit Margin Target**: ${(commerceConfig.economics.target_profit_margin * 100).toFixed(0)}%
- **Real Query Rate**: ${(commerceConfig.economics.blending_strategy.real_query_rate * 100).toFixed(1)}%

## Scoring Framework
- **Clarity Score Range**: ${agentConfig.scoring_framework.clarity_score.range.join(' - ')}
- **QAI Score Range**: ${agentConfig.scoring_framework.qai_score.range.join(' - ')}

## Platform Targets
${Object.entries(agentConfig.platform_targets).map(([platform, config]) =>
  `- **${platform}**: ${config.enabled ? '✅' : '❌'} (weight: ${(config.visibility_weight * 100).toFixed(0)}%)`
).join('\n')}

Generated: ${new Date().toISOString()}
`;

  return report.trim();
}

/**
 * CLI entry point
 */
if (require.main === module) {
  (async () => {
    console.log('🚀 Pulse Agent Builder');
    console.log('========================\n');

    // Validate configuration
    if (!validatePulseAgent()) {
      process.exit(1);
    }

    // Build agent
    const result = await buildPulseAgent({
      includeHashes: true,
      prettify: true,
    });

    if (!result.success) {
      console.error('❌ Build failed');
      process.exit(1);
    }

    // Generate report
    const report = generateAgentReport();
    const reportPath = path.join(process.cwd(), 'canonical/agent-report.md');
    fs.writeFileSync(reportPath, report);

    console.log(`\n📊 Agent report: ${reportPath}`);
    console.log('\n✅ All done!');
  })();
}
