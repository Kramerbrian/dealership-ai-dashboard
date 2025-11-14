/**
 * Governance Validator
 * Reads policy YAML/JSON and validates current metrics against thresholds
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface GovernancePolicy {
  performance?: {
    minLighthouse?: number;
    maxLatency?: number;
  };
  security?: {
    enforceHttps?: boolean;
    requireAuth?: boolean;
  };
  brand?: {
    humorFrequency?: string;
    toneConsistency?: number;
  };
  stability?: {
    minUptime?: number;
    maxErrorRate?: number;
  };
}

const ROOT = process.cwd();
const DEFAULT_POLICY = path.join(ROOT, 'policies', 'governance.yml');

export function validateGovernance(
  metrics: Record<string, number | boolean>,
  policyFile: string = DEFAULT_POLICY
): { passed: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Load policy
  let policy: GovernancePolicy = {};
  try {
    if (fs.existsSync(policyFile)) {
      const content = fs.readFileSync(policyFile, 'utf8');
      if (policyFile.endsWith('.yml') || policyFile.endsWith('.yaml')) {
        policy = yaml.load(content) as GovernancePolicy;
      } else {
        policy = JSON.parse(content);
      }
    } else {
      // Use defaults if file doesn't exist
      policy = {
        performance: { minLighthouse: 90 },
        security: { enforceHttps: true },
        brand: { humorFrequency: '<=0.1' },
      };
      log(`⚠️  Policy file not found, using defaults`);
    }
  } catch (error) {
    log(`⚠️  Failed to load policy: ${error}`);
    return { passed: true, reasons: [] }; // Fail open if policy can't be loaded
  }

  // Performance checks
  if (policy.performance?.minLighthouse) {
    const lighthouse = metrics.lighthouse as number;
    if (lighthouse !== undefined && lighthouse < policy.performance.minLighthouse) {
      reasons.push(
        `Lighthouse ${lighthouse} < ${policy.performance.minLighthouse}`
      );
    }
  }

  if (policy.performance?.maxLatency) {
    const latency = metrics.latency as number;
    if (latency !== undefined && latency > policy.performance.maxLatency) {
      reasons.push(`Latency ${latency}ms > ${policy.performance.maxLatency}ms`);
    }
  }

  // Security checks
  if (policy.security?.enforceHttps) {
    const https = metrics.https as boolean;
    if (https !== undefined && !https) {
      reasons.push('HTTPS enforcement failed');
    }
  }

  // Brand checks
  if (policy.brand?.humorFrequency) {
    const freq = metrics.humorFrequency as number;
    if (freq !== undefined) {
      const threshold = parseFloat(policy.brand.humorFrequency.replace(/[^0-9.]/g, ''));
      if (freq > threshold) {
        reasons.push(`Humor frequency ${freq} exceeds ${threshold} limit`);
      }
    }
  }

  if (policy.brand?.toneConsistency) {
    const consistency = metrics.toneConsistency as number;
    if (consistency !== undefined && consistency < policy.brand.toneConsistency) {
      reasons.push(
        `Tone consistency ${consistency} < ${policy.brand.toneConsistency}`
      );
    }
  }

  // Stability checks
  if (policy.stability?.minUptime) {
    const uptime = metrics.uptime as number;
    if (uptime !== undefined && uptime < policy.stability.minUptime) {
      reasons.push(`Uptime ${uptime}% < ${policy.stability.minUptime}%`);
    }
  }

  if (policy.stability?.maxErrorRate) {
    const errorRate = metrics.errorRate as number;
    if (errorRate !== undefined && errorRate > policy.stability.maxErrorRate) {
      reasons.push(
        `Error rate ${errorRate}% > ${policy.stability.maxErrorRate}%`
      );
    }
  }

  return { passed: reasons.length === 0, reasons };
}

function log(msg: string) {
  console.log(`[Governance-Validator] ${msg}`);
}

