'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import toast from 'react-hot-toast';

interface MarketingPlatform {
  id: string;
  name: string;
  type: 'search' | 'social' | 'display' | 'email' | 'video' | 'retargeting';
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  campaigns: number;
  adSpend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: Date;
  endDate?: Date;
  targetAudience: string;
  adGroups: number;
  keywords?: string[];
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
}

interface AdCreative {
  id: string;
  campaignId: string;
  name: string;
  type: 'image' | 'video' | 'carousel' | 'text';
  status: 'active' | 'paused' | 'rejected';
  impressions: number;
  clicks: number;
  ctr: number;
  thumbnail?: string;
  headline?: string;
  description?: string;
}

const MarketingPlatformIntegration: React.FC = () => {
  const [platforms, setPlatforms] = useState<MarketingPlatform[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adCreatives, setAdCreatives] = useState<AdCreative[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    initializeMarketingData();
  }, []);

  const initializeMarketingData = () => {
    // Mock marketing platforms
    const mockPlatforms: MarketingPlatform[] = [
      {
        id: 'platform-1',
        name: 'Google Ads',
        type: 'search',
        provider: 'Google',
        status: 'connected',
        lastSync: new Date(Date.now() - 300000),
        campaigns: 12,
        adSpend: 15420,
        impressions: 245000,
        clicks: 8900,
        conversions: 156,
        ctr: 3.63,
        cpc: 1.73,
        cpa: 98.85,
        roas: 4.2
      },
      {
        id: 'platform-2',
        name: 'Facebook Ads',
        type: 'social',
        provider: 'Meta',
        status: 'connected',
        lastSync: new Date(Date.now() - 600000),
        campaigns: 8,
        adSpend: 8750,
        impressions: 180000,
        clicks: 5400,
        conversions: 89,
        ctr: 3.0,
        cpc: 1.62,
        cpa: 98.31,
        roas: 3.8
      },
      {
        id: 'platform-3',
        name: 'Microsoft Advertising',
        type: 'search',
        provider: 'Microsoft',
        status: 'connected',
        lastSync: new Date(Date.now() - 900000),
        campaigns: 6,
        adSpend: 4200,
        impressions: 95000,
        clicks: 3200,
        conversions: 45,
        ctr: 3.37,
        cpc: 1.31,
        cpa: 93.33,
        roas: 4.5
      },
      {
        id: 'platform-4',
        name: 'LinkedIn Ads',
        type: 'social',
        provider: 'LinkedIn',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 86400000),
        campaigns: 0,
        adSpend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpa: 0,
        roas: 0
      }
    ];

    // Mock campaigns
    const mockCampaigns: Campaign[] = [
      {
        id: 'campaign-1',
        name: 'SUV Sales Q4 2024',
        platform: 'Google Ads',
        status: 'active',
        budget: 5000,
        spent: 3200,
        impressions: 85000,
        clicks: 2800,
        conversions: 45,
        startDate: new Date('2024-10-01'),
        targetAudience: 'SUV Buyers 25-55',
        adGroups: 5,
        keywords: ['luxury suv', 'family suv', 'suv deals', 'new suv'],
        demographics: {
          age: { '25-34': 35, '35-44': 40, '45-54': 20, '55+': 5 },
          gender: { 'Male': 60, 'Female': 40 },
          location: { 'California': 25, 'Texas': 20, 'Florida': 15, 'New York': 10, 'Other': 30 }
        }
      },
      {
        id: 'campaign-2',
        name: 'Holiday Car Sales',
        platform: 'Facebook Ads',
        status: 'active',
        budget: 3000,
        spent: 1800,
        impressions: 65000,
        clicks: 1950,
        conversions: 32,
        startDate: new Date('2024-11-15'),
        targetAudience: 'Holiday Shoppers',
        adGroups: 3,
        demographics: {
          age: { '25-34': 30, '35-44': 35, '45-54': 25, '55+': 10 },
          gender: { 'Male': 55, 'Female': 45 },
          location: { 'California': 30, 'Texas': 25, 'Florida': 20, 'New York': 15, 'Other': 10 }
        }
      }
    ];

    // Mock ad creatives
    const mockCreatives: AdCreative[] = [
      {
        id: 'creative-1',
        campaignId: 'campaign-1',
        name: 'SUV Family Ad',
        type: 'image',
        status: 'active',
        impressions: 25000,
        clicks: 850,
        ctr: 3.4,
        headline: 'Find Your Perfect Family SUV',
        description: 'Spacious, safe, and reliable SUVs for your family'
      },
      {
        id: 'creative-2',
        campaignId: 'campaign-1',
        name: 'Luxury SUV Video',
        type: 'video',
        status: 'active',
        impressions: 18000,
        clicks: 720,
        ctr: 4.0,
        headline: 'Experience Luxury Like Never Before',
        description: 'Premium SUVs with cutting-edge technology'
      }
    ];

    setPlatforms(mockPlatforms);
    setCampaigns(mockCampaigns);
    setAdCreatives(mockCreatives);
    setSelectedPlatform(mockPlatforms[0].id);
  };

  const syncPlatform = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    setIsSyncing(true);
    toast.loading(`Syncing ${platform.name}...`, { id: 'sync-platform' });

    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update platform data
    setPlatforms(prev => prev.map(p => 
      p.id === platformId ? {
        ...p,
        lastSync: new Date(),
        adSpend: p.adSpend + Math.floor(Math.random() * 1000),
        impressions: p.impressions + Math.floor(Math.random() * 10000),
        clicks: p.clicks + Math.floor(Math.random() * 500),
        conversions: p.conversions + Math.floor(Math.random() * 10)
      } : p
    ));

    toast.success(`${platform.name} synced successfully!`, { id: 'sync-platform' });
    setIsSyncing(false);
  };

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case 'search': return '🔍';
      case 'social': return '📱';
      case 'display': return '🖼️';
      case 'email': return '📧';
      case 'video': return '🎥';
      case 'retargeting': return '🎯';
      default: return '📢';
    }
  };

  const getProviderLogo = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google': return '🔍';
      case 'meta': return '📘';
      case 'microsoft': return '🪟';
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      case 'tiktok': return '🎵';
      default: return '📢';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active': return '#10b981';
      case 'disconnected':
      case 'paused': return '#ef4444';
      case 'error':
      case 'ended': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);
  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

  const totalMetrics = platforms.reduce((acc, platform) => ({
    adSpend: acc.adSpend + platform.adSpend,
    impressions: acc.impressions + platform.impressions,
    clicks: acc.clicks + platform.clicks,
    conversions: acc.conversions + platform.conversions
  }), { adSpend: 0, impressions: 0, clicks: 0, conversions: 0 });

  const overallCTR = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
  const overallCPC = totalMetrics.clicks > 0 ? totalMetrics.adSpend / totalMetrics.clicks : 0;
  const overallCPA = totalMetrics.conversions > 0 ? totalMetrics.adSpend / totalMetrics.conversions : 0;

  return (
    <div className="marketing-platform-integration">
      <h3>📢 Marketing Platform Integration</h3>
      <p>Connect and manage all your marketing platforms in one unified dashboard.</p>

      {/* Overall Performance Metrics */}
      <div className="overall-metrics">
        <h4>📊 Overall Performance</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <h5>Total Ad Spend</h5>
            <div className="metric-value">${totalMetrics.adSpend.toLocaleString()}</div>
            <div className="metric-label">This Month</div>
          </div>
          <div className="metric-card">
            <h5>Total Impressions</h5>
            <div className="metric-value">{totalMetrics.impressions.toLocaleString()}</div>
            <div className="metric-label">Across All Platforms</div>
          </div>
          <div className="metric-card">
            <h5>Total Clicks</h5>
            <div className="metric-value">{totalMetrics.clicks.toLocaleString()}</div>
            <div className="metric-label">All Campaigns</div>
          </div>
          <div className="metric-card">
            <h5>Total Conversions</h5>
            <div className="metric-value">{totalMetrics.conversions}</div>
            <div className="metric-label">Leads & Sales</div>
          </div>
          <div className="metric-card">
            <h5>Overall CTR</h5>
            <div className="metric-value">{overallCTR.toFixed(2)}%</div>
            <div className="metric-label">Click-Through Rate</div>
          </div>
          <div className="metric-card">
            <h5>Overall CPC</h5>
            <div className="metric-value">${overallCPC.toFixed(2)}</div>
            <div className="metric-label">Cost Per Click</div>
          </div>
          <div className="metric-card">
            <h5>Overall CPA</h5>
            <div className="metric-value">${overallCPA.toFixed(2)}</div>
            <div className="metric-label">Cost Per Acquisition</div>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="platform-overview">
        <h4>🔗 Connected Platforms</h4>
        <div className="platforms-grid">
          {platforms.map(platform => (
            <div key={platform.id} className="platform-card">
              <div className="platform-header">
                <div className="platform-info">
                  <div className="platform-icon">
                    {getPlatformIcon(platform.type)}
                  </div>
                  <div className="platform-details">
                    <h5>{platform.name}</h5>
                    <div className="provider-info">
                      <span className="provider-logo">{getProviderLogo(platform.provider)}</span>
                      <span className="provider-name">{platform.provider}</span>
                    </div>
                  </div>
                </div>
                <div className="platform-status">
                  <span 
                    className="status-indicator" 
                    style={{ backgroundColor: getStatusColor(platform.status) }}
                  >
                    {platform.status}
                  </span>
                  <button
                    onClick={() => syncPlatform(platform.id)}
                    disabled={isSyncing || platform.status === 'disconnected'}
                    className="sync-button"
                  >
                    🔄 Sync
                  </button>
                </div>
              </div>

              <div className="platform-metrics">
                <div className="metric-row">
                  <div className="metric">
                    <span className="metric-label">Campaigns</span>
                    <span className="metric-value">{platform.campaigns}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Ad Spend</span>
                    <span className="metric-value">${platform.adSpend.toLocaleString()}</span>
                  </div>
                </div>
                <div className="metric-row">
                  <div className="metric">
                    <span className="metric-label">Impressions</span>
                    <span className="metric-value">{platform.impressions.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Clicks</span>
                    <span className="metric-value">{platform.clicks.toLocaleString()}</span>
                  </div>
                </div>
                <div className="metric-row">
                  <div className="metric">
                    <span className="metric-label">CTR</span>
                    <span className="metric-value">{platform.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">ROAS</span>
                    <span className="metric-value">{platform.roas.toFixed(1)}x</span>
                  </div>
                </div>
              </div>

              <div className="platform-actions">
                <button 
                  onClick={() => setSelectedPlatform(platform.id)}
                  className="view-details-button"
                >
                  View Details
                </button>
                <span className="last-sync">
                  Last sync: {platform.lastSync.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Details */}
      {selectedPlatformData && (
        <div className="platform-details">
          <h4>📈 {selectedPlatformData.name} Performance</h4>
          <div className="details-content">
            <div className="performance-charts">
              <div className="chart-container">
                <h5>Performance Trends (Last 7 Days)</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { day: 'Mon', spend: 1200, clicks: 450, conversions: 8 },
                    { day: 'Tue', spend: 1350, clicks: 520, conversions: 12 },
                    { day: 'Wed', spend: 1100, clicks: 380, conversions: 6 },
                    { day: 'Thu', spend: 1450, clicks: 580, conversions: 15 },
                    { day: 'Fri', spend: 1600, clicks: 650, conversions: 18 },
                    { day: 'Sat', spend: 800, clicks: 320, conversions: 5 },
                    { day: 'Sun', spend: 600, clicks: 240, conversions: 3 }
                  ]}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="spend" stroke="#3b82f6" name="Ad Spend ($)" />
                    <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Clicks" />
                    <Line type="monotone" dataKey="conversions" stroke="#f59e0b" name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns */}
      <div className="campaigns-section">
        <h4>🎯 Campaign Performance</h4>
        <div className="campaigns-grid">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="campaign-card">
              <div className="campaign-header">
                <h5>{campaign.name}</h5>
                <span 
                  className="campaign-status" 
                  style={{ backgroundColor: getStatusColor(campaign.status) }}
                >
                  {campaign.status}
                </span>
              </div>
              
              <div className="campaign-metrics">
                <div className="metric">
                  <span className="metric-label">Budget</span>
                  <span className="metric-value">${campaign.budget.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Spent</span>
                  <span className="metric-value">${campaign.spent.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Impressions</span>
                  <span className="metric-value">{campaign.impressions.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Clicks</span>
                  <span className="metric-value">{campaign.clicks.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Conversions</span>
                  <span className="metric-value">{campaign.conversions}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">CTR</span>
                  <span className="metric-value">
                    {((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              {campaign.keywords && campaign.keywords.length > 0 && (
                <div className="campaign-keywords">
                  <h6>Keywords:</h6>
                  <div className="keywords-list">
                    {campaign.keywords.map((keyword, index) => (
                      <span key={index} className="keyword-tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="campaign-demographics">
                <h6>Audience Demographics:</h6>
                <div className="demographics-charts">
                  <div className="demo-chart">
                    <h6>Age Distribution</h6>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={Object.entries(campaign.demographics.age).map(([age, value]) => ({ age, value }))}>
                        <XAxis dataKey="age" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Creatives */}
      <div className="ad-creatives">
        <h4>🎨 Ad Creatives Performance</h4>
        <div className="creatives-grid">
          {adCreatives.map(creative => (
            <div key={creative.id} className="creative-card">
              <div className="creative-header">
                <h5>{creative.name}</h5>
                <span 
                  className="creative-status" 
                  style={{ backgroundColor: getStatusColor(creative.status) }}
                >
                  {creative.status}
                </span>
              </div>
              
              <div className="creative-content">
                <div className="creative-preview">
                  <div className="preview-placeholder">
                    {creative.type === 'image' ? '🖼️' : creative.type === 'video' ? '🎥' : '📝'}
                  </div>
                </div>
                
                <div className="creative-details">
                  {creative.headline && (
                    <div className="creative-headline">
                      <strong>Headline:</strong> {creative.headline}
                    </div>
                  )}
                  {creative.description && (
                    <div className="creative-description">
                      <strong>Description:</strong> {creative.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="creative-metrics">
                <div className="metric">
                  <span className="metric-label">Impressions</span>
                  <span className="metric-value">{creative.impressions.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Clicks</span>
                  <span className="metric-value">{creative.clicks.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">CTR</span>
                  <span className="metric-value">{creative.ctr.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Platform Analytics */}
      <div className="cross-platform-analytics">
        <h4>📊 Cross-Platform Analytics</h4>
        <div className="analytics-charts">
          <div className="chart-container">
            <h5>Platform Performance Comparison</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platforms.map(p => ({
                platform: p.name,
                spend: p.adSpend,
                conversions: p.conversions,
                roas: p.roas
              }))}>
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spend" fill="#3b82f6" name="Ad Spend ($)" />
                <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h5>ROAS by Platform</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platforms.map(p => ({ name: p.name, value: p.roas }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}x`}
                >
                  {platforms.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPlatformIntegration;
