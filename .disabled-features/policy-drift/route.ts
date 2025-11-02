import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

interface PolicyVersion {
  version: string;
  last_updated: string;
  changes: string[];
}

interface PolicyDriftEvent {
  old_version: string;
  new_version: string;
  changes: string[];
  action_required: boolean;
}

async function detectPolicyDrift(): Promise<PolicyDriftEvent | null> {
  try {
    // Get current policy version from database
    const { data: currentVersion, error: versionError } = await supabase
      .from('google_policy_versions')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();
    
    if (versionError) {
      console.error('Error fetching current policy version:', versionError);
      return null;
    }
    
    // Check Google's official policy API (simulated)
    // In a real implementation, you would call Google's API here
    const latestPolicyVersion = await checkGooglePolicyAPI();
    
    if (!latestPolicyVersion || latestPolicyVersion.version === currentVersion.version) {
      return null; // No drift detected
    }
    
    // Calculate changes between versions
    const changes = latestPolicyVersion.changes.filter(
      change => !currentVersion.changes.includes(change)
    );
    
    const actionRequired = changes.some(change => 
      change.toLowerCase().includes('critical') ||
      change.toLowerCase().includes('required') ||
      change.toLowerCase().includes('mandatory')
    );
    
    return {
      old_version: currentVersion.version,
      new_version: latestPolicyVersion.version,
      changes,
      action_required: actionRequired
    };
    
  } catch (error) {
    console.error('Error detecting policy drift:', error);
    return null;
  }
}

async function checkGooglePolicyAPI(): Promise<PolicyVersion | null> {
  // Simulated Google Policy API check
  // In production, this would call the actual Google Ads API
  
  try {
    // Simulate API call with random chance of policy update
    const hasUpdate = Math.random() < 0.1; // 10% chance of update for testing
    
    if (!hasUpdate) {
      return null;
    }
    
    // Simulate new policy version
    const newVersion: PolicyVersion = {
      version: `2025.${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 28) + 1}`,
      last_updated: new Date().toISOString(),
      changes: [
        'Enhanced disclosure requirements for lease offers',
        'Updated APR display guidelines',
        'New fee transparency standards',
        'Stricter pricing consistency rules'
      ]
    };
    
    return newVersion;
    
  } catch (error) {
    console.error('Error checking Google Policy API:', error);
    return null;
  }
}

async function savePolicyVersion(version: PolicyVersion): Promise<void> {
  const { error } = await supabase
    .from('google_policy_versions')
    .insert({
      version: version.version,
      last_updated: version.last_updated,
      last_checked: new Date().toISOString(),
      changes: version.changes
    });
  
  if (error) {
    console.error('Error saving policy version:', error);
    throw error;
  }
}

async function saveDriftEvent(event: PolicyDriftEvent): Promise<void> {
  const { error } = await supabase
    .from('google_policy_drift_events')
    .insert({
      old_version: event.old_version,
      new_version: event.new_version,
      changes: event.changes,
      action_required: event.action_required,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error saving drift event:', error);
    throw error;
  }
}

async function notifyPolicyDrift(event: PolicyDriftEvent): Promise<void> {
  const emailContent = {
    to: process.env.COMPLIANCE_EMAIL_RECIPIENTS?.split(',') || [],
    from: process.env.RESEND_FROM_EMAIL!,
    subject: `📢 Google Ads Policy Update Detected`,
    html: `
      <h2>Google Ads Policy Update</h2>
      <p><strong>Version:</strong> ${event.old_version} → ${event.new_version}</p>
      <p><strong>Action Required:</strong> ${event.action_required ? 'Yes' : 'No'}</p>
      <h3>Changes:</h3>
      <ul>
        ${event.changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
      ${event.action_required ? '<p><strong>⚠️ Immediate action may be required!</strong></p>' : ''}
    `
  };
  
  // Send email notification
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContent),
      });
      
      if (!response.ok) {
        console.error('Failed to send policy drift email notification');
      }
    } catch (error) {
      console.error('Error sending policy drift email notification:', error);
    }
  }
  
  // Send Slack notification
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const slackMessage = {
        text: `📢 Google Ads Policy Update Detected`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Google Ads Policy Update*\n*Version:* ${event.old_version} → ${event.new_version}\n*Action Required:* ${event.action_required ? 'Yes' : 'No'}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Changes:*\n${event.changes.map(change => `• ${change}`).join('\n')}`
            }
          }
        ]
      };
      
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });
    } catch (error) {
      console.error('Error sending policy drift Slack notification:', error);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify CRON secret for security
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

    console.log('Starting policy drift detection...');

    // Detect policy drift
    const driftEvent = await detectPolicyDrift();

    if (!driftEvent) {
    return NextResponse.json({
      success: true,
        message: 'No policy drift detected',
        checked_at: new Date().toISOString()
      });
    }
    
    console.log('Policy drift detected:', driftEvent);
    
    // Save new policy version
    const newVersion: PolicyVersion = {
      version: driftEvent.new_version,
      last_updated: new Date().toISOString(),
      changes: driftEvent.changes
    };
    
    await savePolicyVersion(newVersion);
    
    // Save drift event
    await saveDriftEvent(driftEvent);
    
    // Send notifications
    await notifyPolicyDrift(driftEvent);
    
    // Update Redis cache
    try {
      await redis.del('compliance_summary:*'); // Clear compliance cache
    } catch (error) {
      console.warn('Failed to clear compliance cache:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Policy drift detected and processed',
      drift_event: driftEvent,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in policy drift detection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}