import { supabase } from '../database/supabase';
import { config } from '../config/config';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: boolean;
    stripe: boolean;
    openai: boolean;
    clerk: boolean;
  };
  uptime: number;
  version: string;
}

export interface DetailedHealthStatus extends HealthStatus {
  details: {
    database: {
      connected: boolean;
      responseTime: number;
      error?: string;
    };
    stripe: {
      connected: boolean;
      responseTime: number;
      error?: string;
    };
    openai: {
      connected: boolean;
      responseTime: number;
      error?: string;
    };
    clerk: {
      connected: boolean;
      responseTime: number;
      error?: string;
    };
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

export class HealthService {
  private startTime = Date.now();

  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const services = await this.checkServices();
      const overallHealth = Object.values(services).every(status => status);

      return {
        status: overallHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services,
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: false,
          stripe: false,
          openai: false,
          clerk: false,
        },
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
      };
    }
  }

  async getDetailedHealthStatus(): Promise<DetailedHealthStatus> {
    try {
      const basicHealth = await this.getHealthStatus();
      const serviceDetails = await this.checkServicesDetailed();
      const systemInfo = await this.getSystemInfo();

      return {
        ...basicHealth,
        details: serviceDetails,
        system: systemInfo,
      };
    } catch (error) {
      console.error('Detailed health check error:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: false,
          stripe: false,
          openai: false,
          clerk: false,
        },
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
        details: {
          database: { connected: false, responseTime: 0, error: error.message },
          stripe: { connected: false, responseTime: 0, error: error.message },
          openai: { connected: false, responseTime: 0, error: error.message },
          clerk: { connected: false, responseTime: 0, error: error.message },
        },
        system: {
          memory: { used: 0, total: 0, percentage: 0 },
          cpu: { usage: 0 },
        },
      };
    }
  }

  async isReady(): Promise<boolean> {
    try {
      const services = await this.checkServices();
      return Object.values(services).every(status => status);
    } catch (error) {
      console.error('Readiness check error:', error);
      return false;
    }
  }

  private async checkServices(): Promise<HealthStatus['services']> {
    const [database, stripe, openai, clerk] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkStripe(),
      this.checkOpenAI(),
      this.checkClerk(),
    ]);

    return {
      database: database.status === 'fulfilled' && database.value,
      stripe: stripe.status === 'fulfilled' && stripe.value,
      openai: openai.status === 'fulfilled' && openai.value,
      clerk: clerk.status === 'fulfilled' && clerk.value,
    };
  }

  private async checkServicesDetailed(): Promise<DetailedHealthStatus['details']> {
    const [database, stripe, openai, clerk] = await Promise.allSettled([
      this.checkDatabaseDetailed(),
      this.checkStripeDetailed(),
      this.checkOpenAIDetailed(),
      this.checkClerkDetailed(),
    ]);

    return {
      database: database.status === 'fulfilled' ? database.value : { connected: false, responseTime: 0, error: 'Check failed' },
      stripe: stripe.status === 'fulfilled' ? stripe.value : { connected: false, responseTime: 0, error: 'Check failed' },
      openai: openai.status === 'fulfilled' ? openai.value : { connected: false, responseTime: 0, error: 'Check failed' },
      clerk: clerk.status === 'fulfilled' ? clerk.value : { connected: false, responseTime: 0, error: 'Check failed' },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const start = Date.now();
      await supabase.from('users').select('count').limit(1);
      return Date.now() - start < 5000; // 5 second timeout
    } catch (error) {
      return false;
    }
  }

  private async checkDatabaseDetailed() {
    try {
      const start = Date.now();
      await supabase.from('users').select('count').limit(1);
      const responseTime = Date.now() - start;
      return {
        connected: true,
        responseTime,
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: 0,
        error: error.message,
      };
    }
  }

  private async checkStripe(): Promise<boolean> {
    try {
      // Simple check - verify API key is configured
      return !!config.stripe.secretKey;
    } catch (error) {
      return false;
    }
  }

  private async checkStripeDetailed() {
    try {
      const start = Date.now();
      // In a real implementation, you might make a lightweight API call
      const responseTime = Date.now() - start;
      return {
        connected: !!config.stripe.secretKey,
        responseTime,
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: 0,
        error: error.message,
      };
    }
  }

  private async checkOpenAI(): Promise<boolean> {
    try {
      return !!config.ai.openaiApiKey;
    } catch (error) {
      return false;
    }
  }

  private async checkOpenAIDetailed() {
    try {
      const start = Date.now();
      // In a real implementation, you might make a lightweight API call
      const responseTime = Date.now() - start;
      return {
        connected: !!config.ai.openaiApiKey,
        responseTime,
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: 0,
        error: error.message,
      };
    }
  }

  private async checkClerk(): Promise<boolean> {
    try {
      return !!config.auth.clerkSecretKey;
    } catch (error) {
      return false;
    }
  }

  private async checkClerkDetailed() {
    try {
      const start = Date.now();
      // In a real implementation, you might make a lightweight API call
      const responseTime = Date.now() - start;
      return {
        connected: !!config.auth.clerkSecretKey,
        responseTime,
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: 0,
        error: error.message,
      };
    }
  }

  private async getSystemInfo() {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = memUsage.heapTotal;
      const usedMem = memUsage.heapUsed;

      return {
        memory: {
          used: usedMem,
          total: totalMem,
          percentage: Math.round((usedMem / totalMem) * 100),
        },
        cpu: {
          usage: process.cpuUsage().user / 1000000, // Convert to seconds
        },
      };
    } catch (error) {
      return {
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 },
      };
    }
  }
}

export const healthService = new HealthService();
