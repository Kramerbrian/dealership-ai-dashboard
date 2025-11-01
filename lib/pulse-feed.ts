/**
 * Pulse Feed Integration
 * 
 * Phase 4 (Retain): Usage/renewal tracking for churn prevention
 * Sends subscription updates and usage data to Pulse feed
 */

interface PulseEvent {
  type: 'subscription.updated' | 'usage.tracked' | 'renewal.warning' | 'churn.risk';
  userId: string;
  subscriptionId?: string;
  plan?: string;
  status?: string;
  usage?: {
    feature: string;
    count: number;
    period: string;
  };
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Send event to Pulse feed
 */
export async function sendToPulseFeed(event: PulseEvent) {
  const pulseUrl = process.env.PULSE_FEED_URL;
  
  if (!pulseUrl) {
    console.warn('PULSE_FEED_URL not configured, skipping Pulse feed update');
    return { success: false, error: 'Pulse feed not configured' };
  }

  try {
    const response = await fetch(`${pulseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PULSE_FEED_API_KEY || ''}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Pulse feed error: ${response.statusText}`);
    }

    console.log(`✅ Pulse event sent: ${event.type} for user ${event.userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending to Pulse feed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Track subscription update for retention monitoring
 */
export async function trackSubscriptionUpdate(data: {
  userId: string;
  subscriptionId: string;
  status: string;
  plan: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}) {
  return sendToPulseFeed({
    type: 'subscription.updated',
    userId: data.userId,
    subscriptionId: data.subscriptionId,
    plan: data.plan,
    status: data.status,
    metadata: {
      currentPeriodEnd: data.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track feature usage for usage-based billing
 */
export async function trackUsage(data: {
  userId: string;
  feature: string;
  count: number;
  period?: 'daily' | 'monthly';
}) {
  return sendToPulseFeed({
    type: 'usage.tracked',
    userId: data.userId,
    usage: {
      feature: data.feature,
      count: data.count,
      period: data.period || 'monthly',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send renewal warning (subscription ending soon)
 */
export async function sendRenewalWarning(data: {
  userId: string;
  subscriptionId: string;
  daysUntilRenewal: number;
}) {
  return sendToPulseFeed({
    type: 'renewal.warning',
    userId: data.userId,
    subscriptionId: data.subscriptionId,
    metadata: {
      daysUntilRenewal: data.daysUntilRenewal,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Flag churn risk (low usage, payment issues, etc.)
 */
export async function flagChurnRisk(data: {
  userId: string;
  subscriptionId: string;
  reason: string;
  riskScore: number; // 0-100
}) {
  return sendToPulseFeed({
    type: 'churn.risk',
    userId: data.userId,
    subscriptionId: data.subscriptionId,
    metadata: {
      reason: data.reason,
      riskScore: data.riskScore,
    },
    timestamp: new Date().toISOString(),
  });
}

