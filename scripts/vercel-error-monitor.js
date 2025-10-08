#!/usr/bin/env node

/**
 * DealershipAI Vercel Error Monitor
 * Real-time monitoring and alerting for Vercel errors
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  appUrl: process.env.VERCEL_URL || 'https://dealershipai.vercel.app',
  checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000, // 1 minute
  alertThresholds: {
    errorRate: 0.1, // 10% error rate
    responseTime: 5000, // 5 seconds
    consecutiveFailures: 3
  },
  alertChannels: {
    webhook: process.env.ALERT_WEBHOOK_URL,
    email: process.env.ALERT_EMAIL,
    slack: process.env.SLACK_WEBHOOK_URL
  },
  logFile: 'vercel-monitor.log',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  retentionDays: 7
};

// State tracking
let state = {
  consecutiveFailures: 0,
  lastCheck: null,
  errorCount: 0,
  totalChecks: 0,
  lastAlert: null,
  isHealthy: true
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging functions
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data,
    state: { ...state }
  };

  // Console output with colors
  const colorMap = {
    'INFO': colors.blue,
    'WARN': colors.yellow,
    'ERROR': colors.red,
    'SUCCESS': colors.green
  };

  console.log(`${colorMap[level] || colors.reset}[${timestamp}] ${level}: ${message}${colors.reset}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }

  // File logging
  fs.appendFileSync(CONFIG.logFile, JSON.stringify(logEntry) + '\n');

  // Rotate log file if it gets too large
  rotateLogFile();
}

function rotateLogFile() {
  try {
    const stats = fs.statSync(CONFIG.logFile);
    if (stats.size > CONFIG.maxLogSize) {
      const backupFile = `${CONFIG.logFile}.${Date.now()}`;
      fs.renameSync(CONFIG.logFile, backupFile);
      log('INFO', 'Log file rotated', { backupFile });
    }
  } catch (error) {
    // Log file doesn't exist or can't be accessed
  }
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'DealershipAI-Monitor/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime
        });
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      reject({
        error: error.message,
        responseTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        responseTime: Date.now() - startTime
      });
    });

    req.end();
  });
}

// Health check function
async function performHealthCheck() {
  const endpoints = [
    { name: 'Health', url: `${CONFIG.appUrl}/api/health` },
    { name: 'Diagnostics', url: `${CONFIG.appUrl}/api/diagnostics?action=full-report` },
    { name: 'Monitoring', url: `${CONFIG.appUrl}/api/monitoring?action=health` }
  ];

  const results = [];
  let overallHealthy = true;

  for (const endpoint of endpoints) {
    try {
      log('INFO', `Checking ${endpoint.name} endpoint`, { url: endpoint.url });
      
      const response = await makeRequest(endpoint.url);
      
      const isHealthy = response.statusCode >= 200 && response.statusCode < 400;
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        healthy: isHealthy,
        data: response.data
      };

      results.push(result);
      
      if (!isHealthy) {
        overallHealthy = false;
        log('WARN', `${endpoint.name} endpoint unhealthy`, result);
      } else {
        log('SUCCESS', `${endpoint.name} endpoint healthy`, { 
          statusCode: response.statusCode, 
          responseTime: response.responseTime 
        });
      }

    } catch (error) {
      overallHealthy = false;
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        error: error.error || error.message,
        responseTime: error.responseTime || 0,
        healthy: false
      };
      
      results.push(result);
      log('ERROR', `${endpoint.name} endpoint failed`, result);
    }
  }

  return {
    overall: overallHealthy,
    results,
    timestamp: new Date().toISOString()
  };
}

// Alert functions
async function sendAlert(alert) {
  const alertData = {
    timestamp: new Date().toISOString(),
    service: 'DealershipAI',
    severity: alert.severity || 'WARNING',
    message: alert.message,
    details: alert.details,
    state: { ...state },
    url: CONFIG.appUrl
  };

  // Send to webhook
  if (CONFIG.alertChannels.webhook) {
    try {
      await sendWebhookAlert(alertData);
    } catch (error) {
      log('ERROR', 'Failed to send webhook alert', { error: error.message });
    }
  }

  // Send to Slack
  if (CONFIG.alertChannels.slack) {
    try {
      await sendSlackAlert(alertData);
    } catch (error) {
      log('ERROR', 'Failed to send Slack alert', { error: error.message });
    }
  }

  // Send email (placeholder)
  if (CONFIG.alertChannels.email) {
    log('INFO', 'Email alert would be sent', { email: CONFIG.alertChannels.email, alert: alertData });
  }

  state.lastAlert = new Date();
}

async function sendWebhookAlert(alertData) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.alertChannels.webhook);
    
    const postData = JSON.stringify(alertData);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function sendSlackAlert(alertData) {
  const slackMessage = {
    text: `🚨 DealershipAI Alert: ${alertData.message}`,
    attachments: [{
      color: alertData.severity === 'CRITICAL' ? 'danger' : 'warning',
      fields: [
        { title: 'Service', value: alertData.service, short: true },
        { title: 'Severity', value: alertData.severity, short: true },
        { title: 'Timestamp', value: alertData.timestamp, short: true },
        { title: 'URL', value: alertData.url, short: true },
        { title: 'Details', value: JSON.stringify(alertData.details, null, 2), short: false }
      ]
    }]
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(slackMessage);
    
    const options = {
      hostname: 'hooks.slack.com',
      port: 443,
      path: '/services/' + CONFIG.alertChannels.slack.split('/').pop(),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Main monitoring loop
async function monitor() {
  try {
    log('INFO', 'Starting health check cycle');
    
    const healthCheck = await performHealthCheck();
    state.totalChecks++;
    state.lastCheck = new Date();

    if (healthCheck.overall) {
      state.consecutiveFailures = 0;
      state.errorCount = 0;
      
      if (!state.isHealthy) {
        state.isHealthy = true;
        log('SUCCESS', 'Service recovered - all endpoints healthy');
        await sendAlert({
          severity: 'INFO',
          message: 'Service recovered',
          details: { healthCheck }
        });
      }
    } else {
      state.consecutiveFailures++;
      state.errorCount++;
      state.isHealthy = false;
      
      const errorRate = state.errorCount / state.totalChecks;
      
      // Check if we should send an alert
      const shouldAlert = 
        state.consecutiveFailures >= CONFIG.alertThresholds.consecutiveFailures ||
        errorRate >= CONFIG.alertThresholds.errorRate ||
        healthCheck.results.some(r => r.responseTime > CONFIG.alertThresholds.responseTime);

      if (shouldAlert) {
        const severity = state.consecutiveFailures >= 5 ? 'CRITICAL' : 'WARNING';
        
        await sendAlert({
          severity,
          message: `Service unhealthy - ${state.consecutiveFailures} consecutive failures`,
          details: {
            healthCheck,
            errorRate: errorRate.toFixed(2),
            consecutiveFailures: state.consecutiveFailures
          }
        });
      }
    }

    // Log current state
    log('INFO', 'Health check completed', {
      healthy: healthCheck.overall,
      consecutiveFailures: state.consecutiveFailures,
      errorRate: (state.errorCount / state.totalChecks).toFixed(2),
      totalChecks: state.totalChecks
    });

  } catch (error) {
    log('ERROR', 'Health check failed', { error: error.message });
    state.consecutiveFailures++;
    state.errorCount++;
  }
}

// Cleanup old logs
function cleanupLogs() {
  try {
    const files = fs.readdirSync('.');
    const logFiles = files.filter(file => file.startsWith(CONFIG.logFile));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.retentionDays);
    
    for (const file of logFiles) {
      const stats = fs.statSync(file);
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(file);
        log('INFO', 'Cleaned up old log file', { file });
      }
    }
  } catch (error) {
    log('ERROR', 'Failed to cleanup logs', { error: error.message });
  }
}

// Signal handlers
process.on('SIGINT', () => {
  log('INFO', 'Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('INFO', 'Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Main execution
async function main() {
  log('INFO', 'DealershipAI Vercel Error Monitor starting', {
    appUrl: CONFIG.appUrl,
    checkInterval: CONFIG.checkInterval,
    alertChannels: Object.keys(CONFIG.alertChannels).filter(key => CONFIG.alertChannels[key])
  });

  // Initial health check
  await monitor();

  // Setup periodic monitoring
  const interval = setInterval(monitor, CONFIG.checkInterval);

  // Setup log cleanup (daily)
  const cleanupInterval = setInterval(cleanupLogs, 24 * 60 * 60 * 1000);

  // Keep the process running
  process.on('exit', () => {
    clearInterval(interval);
    clearInterval(cleanupInterval);
    log('INFO', 'DealershipAI Vercel Error Monitor stopped');
  });
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
DealershipAI Vercel Error Monitor

Usage: node vercel-error-monitor.js [options]

Options:
  --help, -h          Show this help message
  --once              Run health check once and exit
  --config <file>     Load configuration from file

Environment Variables:
  VERCEL_URL          Your Vercel app URL
  CHECK_INTERVAL      Check interval in milliseconds (default: 60000)
  ALERT_WEBHOOK_URL   Webhook URL for alerts
  ALERT_EMAIL         Email address for alerts
  SLACK_WEBHOOK_URL   Slack webhook URL for alerts

Examples:
  node vercel-error-monitor.js
  node vercel-error-monitor.js --once
  CHECK_INTERVAL=30000 node vercel-error-monitor.js
`);
  process.exit(0);
}

if (process.argv.includes('--once')) {
  monitor().then(() => {
    log('INFO', 'Single health check completed');
    process.exit(0);
  }).catch((error) => {
    log('ERROR', 'Single health check failed', { error: error.message });
    process.exit(1);
  });
} else {
  main().catch((error) => {
    log('ERROR', 'Monitor failed to start', { error: error.message });
    process.exit(1);
  });
}
