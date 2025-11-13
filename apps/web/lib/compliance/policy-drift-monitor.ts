/**
 * Google Ads Policy Drift Monitor
 *
 * Monitors Google's advertising policies for updates and triggers reloads
 * when new versions are detected.
 *
 * Run as CRON job (weekly):
 *   0 9 * * 1  node -e "require('./lib/compliance/policy-drift-monitor').runPolicyDriftCheck()"
 *
 * Or via Vercel Cron (vercel.json):
 *   {
 *     "crons": [{
 *       "path": "/api/cron/policy-drift",
 *       "schedule": "0 9 * * 1"
 *     }]
 *   }
 */

import { checkPolicyUpdates, type GooglePolicyVersion } from './google-pricing-policy';

// ============================================================================
// POLICY STORAGE
// ============================================================================

interface StoredPolicyVersion {
  version: string;
  lastUpdated: string;
  lastChecked: string;
  changes: string[];
}

/**
 * Get current policy version from storage
 * (Production implementation with Redis + PostgreSQL)
 */
async function getCurrentPolicyVersion(): Promise<StoredPolicyVersion | null> {
  try {
    const { getCurrentPolicyVersion: getVersion } = await import('./storage');
    const version = await getVersion();

    if (!version) {
      return null;
    }

    return {
      version: version.version,
      lastUpdated: version.lastUpdated,
      lastChecked: new Date().toISOString(),
      changes: version.changes,
    };
  } catch (error) {
    console.error('Failed to get current policy version:', error);
    return null;
  }
}

/**
 * Save policy version to storage
 * (Production implementation with Redis + PostgreSQL)
 */
async function savePolicyVersion(version: GooglePolicyVersion): Promise<void> {
  try {
    const { savePolicyVersion: saveVersion } = await import('./storage');
    await saveVersion(version);
    console.log('[PolicyDrift] Saved policy version:', version.version);
  } catch (error) {
    console.error('Failed to save policy version:', error);
  }
}

// ============================================================================
// POLICY DRIFT DETECTION
// ============================================================================

export interface PolicyDriftResult {
  driftDetected: boolean;
  currentVersion: string;
  latestVersion: string;
  changes: string[];
  actionRequired: boolean;
  recommendations: string[];
}

/**
 * Check for policy drift and trigger updates if needed
 */
export async function detectPolicyDrift(): Promise<PolicyDriftResult> {
  console.log('[PolicyDrift] Starting policy drift check...');

  // Get current version
  const current = await getCurrentPolicyVersion();
  if (!current) {
    console.error('[PolicyDrift] No current policy version found');
    return {
      driftDetected: false,
      currentVersion: 'unknown',
      latestVersion: 'unknown',
      changes: [],
      actionRequired: true,
      recommendations: ['Initialize policy version tracking'],
    };
  }

  // Check for updates
  const latest = await checkPolicyUpdates();

  console.log('[PolicyDrift] Current version:', current.version);
  console.log('[PolicyDrift] Latest version:', latest.version);

  // Compare versions
  const driftDetected = current.version !== latest.version;

  if (!driftDetected) {
    console.log('[PolicyDrift] No drift detected');
    return {
      driftDetected: false,
      currentVersion: current.version,
      latestVersion: latest.version,
      changes: [],
      actionRequired: false,
      recommendations: [],
    };
  }

  // Drift detected
  console.log('[PolicyDrift] ⚠️  DRIFT DETECTED');
  console.log('[PolicyDrift] Changes:', latest.changes);

  // Determine if action is required
  const criticalKeywords = ['required', 'mandatory', 'prohibited', 'violation'];
  const actionRequired = latest.changes.some(change =>
    criticalKeywords.some(keyword => change.toLowerCase().includes(keyword))
  );

  // Generate recommendations
  const recommendations: string[] = [
    'Review policy changes and update compliance rules',
    'Re-scan existing ads for new violations',
    'Update disclosure templates if applicable',
  ];

  if (actionRequired) {
    recommendations.unshift('URGENT: Critical policy changes detected - immediate action required');
  }

  // Save new version
  await savePolicyVersion(latest);

  // Save drift event to database
  try {
    const { saveDriftEvent } = await import('./storage');
    await saveDriftEvent({
      oldVersion: current.version,
      newVersion: latest.version,
      changes: latest.changes,
      actionRequired,
    });
  } catch (error) {
    console.error('[PolicyDrift] Failed to save drift event:', error);
  }

  // Trigger notifications
  await notifyPolicyDrift(current.version, latest.version, latest.changes);

  return {
    driftDetected: true,
    currentVersion: current.version,
    latestVersion: latest.version,
    changes: latest.changes,
    actionRequired,
    recommendations,
  };
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Send notifications about policy drift
 * (Production implementation with Resend + Slack)
 */
async function notifyPolicyDrift(
  oldVersion: string,
  newVersion: string,
  changes: string[]
): Promise<void> {
  console.log('[PolicyDrift] Sending notifications...');

  try {
    const { notifyPolicyDrift: sendNotifications } = await import('./notifications');
    await sendNotifications(oldVersion, newVersion, changes);
    console.log('[PolicyDrift] Notifications sent successfully');
  } catch (error) {
    console.error('[PolicyDrift] Failed to send notifications:', error);
    // Don't throw - policy drift detection should complete even if notifications fail
  }
}

// ============================================================================
// CRON JOB HANDLER
// ============================================================================

/**
 * Main CRON job entry point
 * Run this function on a schedule (e.g., weekly)
 */
export async function runPolicyDriftCheck(): Promise<PolicyDriftResult> {
  console.log('[PolicyDrift] ===== CRON JOB STARTED =====');
  console.log('[PolicyDrift] Timestamp:', new Date().toISOString());

  try {
    const result = await detectPolicyDrift();

    if (result.driftDetected) {
      console.log('[PolicyDrift] ===== DRIFT DETECTED =====');
      console.log('[PolicyDrift] Action required:', result.actionRequired);
      console.log('[PolicyDrift] Recommendations:', result.recommendations);
    } else {
      console.log('[PolicyDrift] ===== NO DRIFT =====');
    }

    console.log('[PolicyDrift] ===== CRON JOB COMPLETED =====');
    return result;
  } catch (error) {
    console.error('[PolicyDrift] CRON job failed:', error);
    throw error;
  }
}

// ============================================================================
// MANUAL TRIGGER (FOR TESTING)
// ============================================================================

/**
 * Manually trigger policy drift check
 * Usage: npm run check-policy-drift
 */
if (require.main === module) {
  runPolicyDriftCheck()
    .then(result => {
      console.log('\n=== RESULT ===');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
