/**
 * DealershipAI Meta-Orchestrator
 * ------------------------------------------------------------
 *  - Reads all manifests in project root
 *  - Builds dependency DAG
 *  - Executes each job in correct order
 *  - Updates lastRun / success fields
 *  - Writes consolidated /public/system-state.json
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { validateGovernance } from './governance-validator';
import { isSafeMode, triggerSafeMode, clearSafeMode } from './safe-mode-handler';

interface ManifestJob {
  id: string;
  dependsOn?: string[];
  script?: string;
  schedule?: string;
  successMetric?: string;
  output?: string;
  api?: string;
  path?: string;
}

interface ManifestFile {
  manifestVersion?: string;
  project?: string;
  systems?: Record<string, any>;
  loops?: Record<string, any>;
  automation?: any;
  selfOptimization?: any;
  lastRun?: string;
  lastExecuted?: string;
}

const ROOT = process.cwd();
const STATE_PATH = path.join(ROOT, 'public', 'system-state.json');

// ---------------- Utility helpers ----------------
function log(msg: string) {
  console.log(`[Meta-Orchestrator] ${msg}`);
}

function loadJSON(file: string): any {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    log(`Failed to load ${file}: ${error}`);
    return null;
  }
}

function writeJSON(file: string, data: any) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------------- DAG builder ----------------
function buildJobList(manifests: ManifestFile[]): ManifestJob[] {
  const jobs: ManifestJob[] = [];

  for (const mf of manifests) {
    if (!mf) continue;

    const systems = mf.systems || mf.loops || {};
    for (const [key, val] of Object.entries(systems)) {
      if (val && (val.script || val.api || val.path)) {
        jobs.push({
          id: key.toUpperCase().replace(/-/g, '_'),
          dependsOn: val.dependsOn?.map((d: string) => d.toUpperCase().replace(/-/g, '_')) || [],
          script: val.script || val.api || val.path,
          schedule: val.schedule || val.updateInterval || val.updateSchedule,
          successMetric: val.successMetric,
          output: val.output,
        });
      }
    }

    // Check automation.cronJobs
    if (mf.automation?.cronJobs) {
      for (const cron of mf.automation.cronJobs) {
        if (cron.path) {
          jobs.push({
            id: `CRON_${cron.path.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '').toUpperCase()}`,
            script: cron.path,
            schedule: cron.schedule,
          });
        }
      }
    }
  }

  return jobs;
}

/** topological sort */
function topoSort(jobs: ManifestJob[]): ManifestJob[] {
  const result: ManifestJob[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(job: ManifestJob) {
    if (visited.has(job.id)) return;
    if (visiting.has(job.id)) {
      log(`⚠️  Circular dependency detected involving ${job.id}`);
      return;
    }

    visiting.add(job.id);
    if (job.dependsOn) {
      job.dependsOn.forEach((dep) => {
        const found = jobs.find((j) => j.id === dep);
        if (found) visit(found);
      });
    }
    visiting.delete(job.id);
    visited.add(job.id);
    result.push(job);
  }

  jobs.forEach((j) => visit(j));
  return result;
}

// ---------------- Job executor ----------------
function runJob(job: ManifestJob): { id: string; success: boolean; duration: string; error?: string } {
  log(`→ Executing ${job.id}`);
  let success = false;
  let error: string | undefined;
  const start = Date.now();

  try {
    if (job.script?.endsWith('.ts') || job.script?.endsWith('.js')) {
      const abs = path.isAbsolute(job.script)
        ? job.script
        : path.join(ROOT, job.script.replace(/^\//, ''));
      if (!fs.existsSync(abs)) {
        log(`   ⚠️  Script not found: ${abs}`);
        return { id: job.id, success: false, duration: '0.00', error: 'Script not found' };
      }
      const result = spawnSync('node', ['--loader', 'ts-node/esm', abs], {
        stdio: 'inherit',
        cwd: ROOT,
      });
      success = result.status === 0;
      if (!success) error = `Exit code ${result.status}`;
    } else if (job.script?.startsWith('/api/') || job.script?.startsWith('http')) {
      const url = job.script.startsWith('http') ? job.script : `https://dash.dealershipai.com${job.script}`;
      const result = spawnSync('curl', ['-s', '-f', url], { stdio: 'pipe' });
      success = result.status === 0;
      if (!success) error = `HTTP ${result.status}`;
    } else {
      log(`   ⚠️  No executable script for ${job.id}`);
      return { id: job.id, success: false, duration: '0.00', error: 'No executable script' };
    }
  } catch (err) {
    error = (err as Error).message;
    log(`   ❌  ${job.id} failed: ${error}`);
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  log(`   ${success ? '✅' : '❌'} ${job.id} completed in ${duration}s`);
  return { id: job.id, success, duration, error };
}

// ---------------- Main orchestrator ----------------
export function runOrchestrator() {
  log('Starting orchestrator...');

  // Check safe mode
  if (isSafeMode()) {
    log('🛑 System in safe mode; skipping non-critical jobs.');
    return { safeMode: true };
  }

  // Find all manifest files
  const manifestFiles = [
    path.join(ROOT, 'dealershipai-master-manifest.json'),
    path.join(ROOT, 'dealershipai-roadmap-manifest.json'),
    path.join(ROOT, 'dealershipai-hyper-optimization-manifest.json'),
    path.join(ROOT, 'dealershipai-meta-intelligence-manifest.json'),
    path.join(ROOT, 'pulse', 'master-pulse-config.json'),
  ].filter((f) => fs.existsSync(f));

  if (manifestFiles.length === 0) {
    log('⚠️  No manifest files found');
    return { error: 'No manifests found' };
  }

  const manifests: ManifestFile[] = manifestFiles.map(loadJSON).filter(Boolean);
  const jobs = topoSort(buildJobList(manifests));

  log(`Found ${jobs.length} jobs to execute`);

  const results: Record<string, any> = {};
  let consecutiveFailures = 0;

  for (const job of jobs) {
    // Governance check before running
    const currentMetrics = {
      lighthouse: 95, // Would fetch from actual metrics
      https: true,
      humorFrequency: 0.05,
    };

    const gov = validateGovernance(currentMetrics);
    if (!gov.passed) {
      log(`🚫 Governance check failed for ${job.id}: ${gov.reasons.join('; ')}`);
      triggerSafeMode(`Governance violation: ${gov.reasons.join('; ')}`);
      return { safeMode: true, reason: gov.reasons };
    }

    const res = runJob(job);
    results[job.id] = {
      success: res.success,
      duration: res.duration,
      lastRun: new Date().toISOString(),
      error: res.error,
    };

    if (!res.success) {
      consecutiveFailures++;
      if (consecutiveFailures >= 3) {
        log('🛑 Three consecutive failures detected; entering safe mode');
        triggerSafeMode('Three consecutive job failures');
        return { safeMode: true, results };
      }
    } else {
      consecutiveFailures = 0;
    }
  }

  // Update manifest metadata
  manifests.forEach((m, i) => {
    if (m) {
      (m as any).lastRun = new Date().toISOString();
      writeJSON(manifestFiles[i], m);
    }
  });

  // Write consolidated system state
  writeJSON(STATE_PATH, {
    timestamp: new Date().toISOString(),
    results,
    totalJobs: jobs.length,
    successfulJobs: Object.values(results).filter((r: any) => r.success).length,
  });

  log(`System-state written to ${STATE_PATH}`);
  return results;
}

// CLI entry
if (require.main === module) {
  runOrchestrator();
}

