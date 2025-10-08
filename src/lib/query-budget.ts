// src/lib/query-budget.ts

import { cacheManager } from './cache-manager';
import { monitoring } from './monitoring';

interface BudgetConfig {
  dailyLimit: number;
  monthlyLimit: number;
  costPerQuery: number;
  alertThreshold: number; // percentage of budget used
}

class QueryBudgetManager {
  private config: BudgetConfig;
  private redis: any;

  constructor() {
    this.config = {
      dailyLimit: parseInt(process.env.DAILY_AI_QUERY_LIMIT || '50'),
      monthlyLimit: parseInt(process.env.MONTHLY_AI_QUERY_LIMIT || '1000'),
      costPerQuery: parseFloat(process.env.AI_QUERY_COST || '0.10'),
      alertThreshold: 80, // Alert at 80% of budget
    };
  }

  async canMakeQuery(): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM

    // Check daily limit
    const dailyCount = await this.getQueryCount(`daily:${today}`);
    if (dailyCount >= this.config.dailyLimit) {
      return {
        allowed: false,
        reason: 'Daily query limit exceeded',
        remaining: 0,
      };
    }

    // Check monthly limit
    const monthlyCount = await this.getQueryCount(`monthly:${month}`);
    if (monthlyCount >= this.config.monthlyLimit) {
      return {
        allowed: false,
        reason: 'Monthly query limit exceeded',
        remaining: 0,
      };
    }

    const remaining = Math.min(
      this.config.dailyLimit - dailyCount,
      this.config.monthlyLimit - monthlyCount
    );

    return {
      allowed: true,
      remaining,
    };
  }

  async recordQuery(provider: string, cost?: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().substring(0, 7);

    // Increment counters
    await this.incrementQueryCount(`daily:${today}`);
    await this.incrementQueryCount(`monthly:${month}`);

    // Track cost
    const actualCost = cost || this.config.costPerQuery;
    await this.recordCost(today, actualCost);
    await this.recordCost(month, actualCost);

    // Track metrics
    monitoring.trackAIQuery(provider, actualCost);

    // Check if we need to send alerts
    await this.checkBudgetAlerts();
  }

  async getQueryCount(period: string): Promise<number> {
    const key = `budget:queries:${period}`;
    const count = await cacheManager.get<number>(key);
    return count || 0;
  }

  async incrementQueryCount(period: string): Promise<number> {
    const key = `budget:queries:${period}`;
    const current = await this.getQueryCount(period);
    const newCount = current + 1;
    
    // Set TTL based on period
    const ttl = period.startsWith('daily:') ? 86400 : 2592000; // 1 day or 30 days
    await cacheManager.set(key, newCount, { ttl });
    
    return newCount;
  }

  async recordCost(period: string, cost: number): Promise<void> {
    const key = `budget:cost:${period}`;
    const current = await cacheManager.get<number>(key) || 0;
    const newTotal = current + cost;
    
    const ttl = period.includes('-') && period.length === 7 ? 2592000 : 86400;
    await cacheManager.set(key, newTotal, { ttl });
  }

  async getBudgetStatus(): Promise<{
    daily: { used: number; limit: number; remaining: number; percentage: number };
    monthly: { used: number; limit: number; remaining: number; percentage: number };
    cost: { daily: number; monthly: number };
  }> {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().substring(0, 7);

    const dailyQueries = await this.getQueryCount(`daily:${today}`);
    const monthlyQueries = await this.getQueryCount(`monthly:${month}`);
    const dailyCost = await cacheManager.get<number>(`budget:cost:${today}`) || 0;
    const monthlyCost = await cacheManager.get<number>(`budget:cost:${month}`) || 0;

    return {
      daily: {
        used: dailyQueries,
        limit: this.config.dailyLimit,
        remaining: Math.max(0, this.config.dailyLimit - dailyQueries),
        percentage: Math.round((dailyQueries / this.config.dailyLimit) * 100),
      },
      monthly: {
        used: monthlyQueries,
        limit: this.config.monthlyLimit,
        remaining: Math.max(0, this.config.monthlyLimit - monthlyQueries),
        percentage: Math.round((monthlyQueries / this.config.monthlyLimit) * 100),
      },
      cost: {
        daily: dailyCost,
        monthly: monthlyCost,
      },
    };
  }

  private async checkBudgetAlerts(): Promise<void> {
    const status = await this.getBudgetStatus();

    // Check daily alert
    if (status.daily.percentage >= this.config.alertThreshold) {
      await this.sendAlert('daily', status.daily);
    }

    // Check monthly alert
    if (status.monthly.percentage >= this.config.alertThreshold) {
      await this.sendAlert('monthly', status.monthly);
    }
  }

  private async sendAlert(period: 'daily' | 'monthly', data: any): Promise<void> {
    const alert = {
      type: 'budget_alert',
      period,
      percentage: data.percentage,
      used: data.used,
      limit: data.limit,
      remaining: data.remaining,
      timestamp: new Date().toISOString(),
    };

    console.warn(`🚨 BUDGET ALERT: ${period} budget at ${data.percentage}%`, alert);

    // In production, send to your alerting service
    // await this.sendToSlack(alert);
    // await this.sendToPagerDuty(alert);
  }

  async resetBudget(period: 'daily' | 'monthly'): Promise<void> {
    if (period === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      await cacheManager.invalidate(`budget:queries:daily:${today}`);
      await cacheManager.invalidate(`budget:cost:${today}`);
    } else {
      const month = new Date().toISOString().substring(0, 7);
      await cacheManager.invalidate(`budget:queries:monthly:${month}`);
      await cacheManager.invalidate(`budget:cost:${month}`);
    }
  }

  // Get estimated cost for a batch of queries
  estimateCost(queryCount: number): number {
    return queryCount * this.config.costPerQuery;
  }

  // Check if we can afford a batch of queries
  async canAffordBatch(queryCount: number): Promise<{ affordable: boolean; cost: number; reason?: string }> {
    const cost = this.estimateCost(queryCount);
    const status = await this.getBudgetStatus();

    // Check daily budget
    if (status.daily.remaining < queryCount) {
      return {
        affordable: false,
        cost,
        reason: `Would exceed daily limit (${status.daily.remaining} remaining)`,
      };
    }

    // Check monthly budget
    if (status.monthly.remaining < queryCount) {
      return {
        affordable: false,
        cost,
        reason: `Would exceed monthly limit (${status.monthly.remaining} remaining)`,
      };
    }

    return {
      affordable: true,
      cost,
    };
  }
}

export const queryBudget = new QueryBudgetManager();
