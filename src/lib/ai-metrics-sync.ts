import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AISourceConfig {
  id: string;
  name: string;
  platform: string;
  category: string;
  apiEndpoint?: string;
  apiKey?: string;
  refreshInterval: number; // in minutes
  enabled: boolean;
  lastSync?: string;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

export interface AISourceMetrics {
  sourceId: string;
  platform: string;
  category: string;
  visibility: number;
  engagement: number;
  reach: number;
  sentiment: number;
  conversion: number;
  authority: number;
  influence: number;
  growth: number;
  timestamp: string;
  metadata: {
    demographics: any;
    cost: any;
    competitors: any[];
    insights: string[];
    recommendations: string[];
    rawData?: any;
  };
}

export class AIMetricsSync {
  private sources: AISourceConfig[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.loadSourceConfigs();
  }

  private async loadSourceConfigs() {
    try {
      const { data, error } = await supabase
        .from('ai_source_configs')
        .select('*')
        .eq('enabled', true);

      if (error) {
        console.error('Error loading source configs:', error);
        return;
      }

      this.sources = data || [];
    } catch (error) {
      console.error('Error loading source configs:', error);
    }
  }

  public async startSync() {
    if (this.isRunning) {
      console.log('AI Metrics Sync is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting AI Metrics Sync...');

    // Initial sync
    await this.syncAllSources();

    // Set up interval for regular syncing
    this.syncInterval = setInterval(async () => {
      await this.syncAllSources();
    }, 5 * 60 * 1000); // Sync every 5 minutes
  }

  public stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('AI Metrics Sync stopped');
  }

  private async syncAllSources() {
    const syncPromises = this.sources.map(source => this.syncSource(source));
    await Promise.allSettled(syncPromises);
  }

  private async syncSource(source: AISourceConfig) {
    try {
      console.log(`Syncing ${source.name}...`);
      
      // Update sync status
      await this.updateSourceStatus(source.id, 'syncing');

      // Fetch metrics from source
      const metrics = await this.fetchSourceMetrics(source);
      
      if (metrics) {
        // Save metrics to database
        await this.saveMetrics(metrics);
        
        // Update sync status
        await this.updateSourceStatus(source.id, 'success');
        console.log(`Successfully synced ${source.name}`);
      } else {
        throw new Error('No metrics received');
      }
    } catch (error) {
      console.error(`Error syncing ${source.name}:`, error);
      await this.updateSourceStatus(source.id, 'error');
    }
  }

  private async fetchSourceMetrics(source: AISourceConfig): Promise<AISourceMetrics | null> {
    // Mock implementation - in production, this would call actual APIs
    const mockMetrics: AISourceMetrics = {
      sourceId: source.id,
      platform: source.platform,
      category: source.category,
      visibility: Math.floor(Math.random() * 40) + 60,
      engagement: Math.floor(Math.random() * 30) + 50,
      reach: Math.floor(Math.random() * 5000) + 1000,
      sentiment: Math.floor(Math.random() * 30) + 70,
      conversion: Math.floor(Math.random() * 20) + 10,
      authority: Math.floor(Math.random() * 30) + 60,
      influence: Math.floor(Math.random() * 40) + 50,
      growth: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date().toISOString(),
      metadata: {
        demographics: {
          age: { '25-34': 35, '35-44': 40, '45-54': 20, '55+': 5 },
          gender: { male: 55, female: 45 },
          location: { 'North America': 60, 'Europe': 25, 'Asia': 15 }
        },
        cost: {
          monthly: Math.floor(Math.random() * 500) + 100,
          cpm: Math.random() * 20 + 5,
          cpc: Math.random() * 5 + 1
        },
        competitors: [
          { name: 'Competitor A', visibility: Math.floor(Math.random() * 20) + 70 },
          { name: 'Competitor B', visibility: Math.floor(Math.random() * 20) + 65 }
        ],
        insights: [
          `${source.platform} posts about electric vehicles are performing 40% better`,
          `Your ${source.platform} engagement increased 25% this month`,
          `Industry-specific content gets 3x more engagement on ${source.platform}`
        ],
        recommendations: [
          `Post 3x per week on ${source.platform} for optimal engagement`,
          `Use ${source.platform} Analytics to track performance`,
          `Engage with industry leaders' content on ${source.platform}`
        ],
        rawData: {
          apiResponse: 'Mock API response',
          timestamp: new Date().toISOString()
        }
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return mockMetrics;
  }

  private async saveMetrics(metrics: AISourceMetrics) {
    try {
      const { error } = await supabase
        .from('ai_visibility_metrics')
        .upsert({
          tenant_id: 'default', // In production, this would be the actual tenant ID
          source_id: metrics.sourceId,
          platform: metrics.platform,
          category: metrics.category,
          visibility: metrics.visibility,
          engagement: metrics.engagement,
          reach: metrics.reach,
          sentiment: metrics.sentiment,
          conversion: metrics.conversion,
          authority: metrics.authority,
          influence: metrics.influence,
          growth: metrics.growth,
          timestamp: metrics.timestamp,
          metadata: metrics.metadata
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error saving metrics:', error);
      throw error;
    }
  }

  private async updateSourceStatus(sourceId: string, status: AISourceConfig['syncStatus']) {
    try {
      const { error } = await supabase
        .from('ai_source_configs')
        .update({
          sync_status: status,
          last_sync: status === 'success' ? new Date().toISOString() : undefined
        })
        .eq('id', sourceId);

      if (error) {
        console.error('Error updating source status:', error);
      }
    } catch (error) {
      console.error('Error updating source status:', error);
    }
  }

  public async addSource(config: Omit<AISourceConfig, 'id' | 'syncStatus'>) {
    try {
      const { data, error } = await supabase
        .from('ai_source_configs')
        .insert({
          name: config.name,
          platform: config.platform,
          category: config.category,
          api_endpoint: config.apiEndpoint,
          api_key: config.apiKey,
          refresh_interval: config.refreshInterval,
          enabled: config.enabled,
          sync_status: 'idle'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      this.sources.push({
        ...config,
        id: data.id,
        syncStatus: 'idle'
      });

      return data;
    } catch (error) {
      console.error('Error adding source:', error);
      throw error;
    }
  }

  public async removeSource(sourceId: string) {
    try {
      const { error } = await supabase
        .from('ai_source_configs')
        .delete()
        .eq('id', sourceId);

      if (error) {
        throw error;
      }

      this.sources = this.sources.filter(s => s.id !== sourceId);
    } catch (error) {
      console.error('Error removing source:', error);
      throw error;
    }
  }

  public async updateSourceConfig(sourceId: string, updates: Partial<AISourceConfig>) {
    try {
      const { error } = await supabase
        .from('ai_source_configs')
        .update(updates)
        .eq('id', sourceId);

      if (error) {
        throw error;
      }

      const sourceIndex = this.sources.findIndex(s => s.id === sourceId);
      if (sourceIndex !== -1) {
        this.sources[sourceIndex] = { ...this.sources[sourceIndex], ...updates };
      }
    } catch (error) {
      console.error('Error updating source config:', error);
      throw error;
    }
  }

  public getSources(): AISourceConfig[] {
    return this.sources;
  }

  public getSource(sourceId: string): AISourceConfig | undefined {
    return this.sources.find(s => s.id === sourceId);
  }

  public isSyncRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
export const aiMetricsSync = new AIMetricsSync();

// Auto-start sync in production
if (process.env.NODE_ENV === 'production') {
  aiMetricsSync.startSync();
}
