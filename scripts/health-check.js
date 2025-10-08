// scripts/health-check.js
// Runs: Every 5 minutes (cron: */5 * * * *)

const { Pool } = require('pg');
const Redis = require('ioredis');
const axios = require('axios');

class HealthChecker {
  constructor() {
    this.db = new Pool({ connectionString: process.env.DATABASE_URL });
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async checkHealth() {
    console.log('🏥 Starting health check...');
    
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      apis: await this.checkAPIs(),
      cron_jobs: await this.checkCronJobs(),
      timestamp: new Date().toISOString(),
    };

    const allHealthy = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : check.status === 'healthy'
    );

    await this.logHealthStatus(checks, allHealthy);
    
    if (!allHealthy) {
      await this.sendAlert(checks);
    }

    console.log(`✅ Health check complete: ${allHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    return { status: allHealthy ? 'healthy' : 'unhealthy', checks };
  }

  async checkDatabase() {
    try {
      const start = Date.now();
      await this.db.query('SELECT 1');
      const duration = Date.now() - start;
      
      return {
        status: 'healthy',
        response_time: duration,
        message: `Database responding in ${duration}ms`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Database connection failed'
      };
    }
  }

  async checkRedis() {
    try {
      const start = Date.now();
      await this.redis.ping();
      const duration = Date.now() - start;
      
      return {
        status: 'healthy',
        response_time: duration,
        message: `Redis responding in ${duration}ms`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Redis connection failed'
      };
    }
  }

  async checkAPIs() {
    const apiChecks = {
      google_places: await this.checkGooglePlacesAPI(),
      openai: await this.checkOpenAIAPI(),
      anthropic: await this.checkAnthropicAPI(),
    };

    const allHealthy = Object.values(apiChecks).every(check => check.status === 'healthy');
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      apis: apiChecks,
      message: `${Object.values(apiChecks).filter(c => c.status === 'healthy').length}/${Object.keys(apiChecks).length} APIs healthy`
    };
  }

  async checkGooglePlacesAPI() {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
            fields: 'place_id',
            key: process.env.GOOGLE_PLACES_API_KEY,
          },
          timeout: 5000,
        }
      );

      return {
        status: 'healthy',
        response_time: response.headers['x-response-time'] || 'unknown',
        message: 'Google Places API responding'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Google Places API failed'
      };
    }
  }

  async checkOpenAIAPI() {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/models',
        {},
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          timeout: 5000,
        }
      );

      return {
        status: 'healthy',
        models_available: response.data.data.length,
        message: 'OpenAI API responding'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'OpenAI API failed'
      };
    }
  }

  async checkAnthropicAPI() {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          timeout: 5000,
        }
      );

      return {
        status: 'healthy',
        message: 'Anthropic API responding'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Anthropic API failed'
      };
    }
  }

  async checkCronJobs() {
    try {
      // Check if cron jobs have run recently
      const result = await this.db.query(`
        SELECT 
          job_name,
          last_run,
          status,
          error_message
        FROM cron_job_logs
        WHERE last_run > NOW() - INTERVAL '1 hour'
        ORDER BY last_run DESC
      `);

      const recentJobs = result.rows;
      const failedJobs = recentJobs.filter(job => job.status === 'failed');
      
      return {
        status: failedJobs.length === 0 ? 'healthy' : 'unhealthy',
        total_jobs: recentJobs.length,
        failed_jobs: failedJobs.length,
        jobs: recentJobs,
        message: `${recentJobs.length} jobs run in last hour, ${failedJobs.length} failed`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Failed to check cron jobs'
      };
    }
  }

  async logHealthStatus(checks, allHealthy) {
    try {
      await this.db.query(`
        INSERT INTO health_check_logs (checks, status, timestamp)
        VALUES ($1, $2, NOW())
      `, [JSON.stringify(checks), allHealthy ? 'healthy' : 'unhealthy']);
    } catch (error) {
      console.error('Failed to log health status:', error.message);
    }
  }

  async sendAlert(checks) {
    // Send alert to monitoring service (PagerDuty, Slack, etc.)
    const alert = {
      severity: 'warning',
      message: 'DealershipAI system health check failed',
      checks,
      timestamp: new Date().toISOString(),
    };

    console.error('🚨 HEALTH ALERT:', alert);

    // In production, send to your alerting service
    // await this.sendToPagerDuty(alert);
    // await this.sendToSlack(alert);
  }

  async sendToSlack(alert) {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 DealershipAI Health Alert`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Status', value: 'Unhealthy', short: true },
            { title: 'Time', value: alert.timestamp, short: true },
            { title: 'Details', value: JSON.stringify(alert.checks, null, 2), short: false }
          ]
        }]
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
    }
  }
}

// Execute
if (require.main === module) {
  const checker = new HealthChecker();
  checker.checkHealth()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Health check failed:', err);
      process.exit(1);
    });
}

module.exports = HealthChecker;
