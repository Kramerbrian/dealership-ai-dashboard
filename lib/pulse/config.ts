/**
 * Pulse Configuration Loader
 * Reads master-pulse-config.json and provides typed access
 */

import pulseConfig from '@/pulse/master-pulse-config.json';

export interface PulseConfig {
  specVersion: string;
  system: string;
  description: string;
  authentication: {
    provider: string;
    middleware: string;
    sessionSync: {
      enabled: boolean;
      interval: number;
      refreshTokenRotation: boolean;
      secureCookies: boolean;
    };
    roleMapping: Record<string, string[]>;
    onAuthEvent: {
      login: {
        trigger: string;
        payload: string;
      };
      logout: {
        trigger: string;
      };
    };
  };
  telemetry: {
    provider: string;
    realtime: boolean;
    interval: number;
    sources: Record<string, string>;
    targets: Record<string, string>;
    syncStrategy: {
      method: string;
      fallback: string;
      heartbeat: number;
    };
  };
  pulseCards: Array<{
    id: string;
    title: string;
    endpoint: string;
    fields: string[];
    refresh?: number;
    thresholds?: Record<string, string>;
    chart?: {
      type: string;
      color: string;
      duration: string;
    };
  }>;
  middlewareBridge: {
    incoming: {
      path: string;
      functions: string[];
      description: string;
    };
    outgoing: {
      broadcast: string;
      payload: string;
      channels: string[];
    };
  };
  security: {
    rateLimit: {
      perMinute: number;
      burst: number;
    };
    auditTrail: {
      enabled: boolean;
      logFile: string;
    };
    csrfProtection: boolean;
  };
  ui: {
    theme: {
      mode: string;
      accent: string;
      motion: string;
    };
    layout: {
      grid: string;
      responsive: boolean;
    };
    interactions: {
      hoverPulse: boolean;
      autoRefreshIndicators: boolean;
    };
  };
  vercelIntegration: {
    envLink: boolean;
    deployHook: string;
    cronJobs: Array<{
      path: string;
      schedule: string;
    }>;
    analytics: string;
  };
  notifications: {
    slack: {
      channel: string;
      message: string;
    };
    email: {
      enabled: boolean;
      template: string;
      recipients: string[];
    };
  };
  versioning: {
    autoIncrement: boolean;
    backupConfig: string;
    lastUpdated: string;
  };
}

export const config: PulseConfig = pulseConfig as PulseConfig;

/**
 * Get dealer session context from Clerk
 */
export function getDealerSessionContext(user: any): {
  dealerId: string;
  role: string;
  permissions: string[];
} {
  const dealerId = (user?.publicMetadata?.dealer as string) || 'default';
  const role = (user?.publicMetadata?.role as string) || 'dealer';
  const permissions = config.authentication.roleMapping[role] || config.authentication.roleMapping.dealer || [];

  return { dealerId, role, permissions };
}

/**
 * Check if user has permission
 */
export function hasPermission(user: any, permission: string): boolean {
  const { permissions } = getDealerSessionContext(user);
  return permissions.includes(permission);
}

