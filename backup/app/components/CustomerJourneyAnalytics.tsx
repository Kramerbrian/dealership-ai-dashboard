'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Sankey, BarChart, Bar, ScatterChart, Scatter, FunnelChart, Funnel, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface CustomerTouchpoint {
  id: string;
  stage: 'awareness' | 'interest' | 'consideration' | 'purchase' | 'retention' | 'advocacy';
  channel: 'website' | 'social_media' | 'email' | 'phone' | 'in_person' | 'advertising';
  action: string;
  timestamp: Date;
  duration: number; // minutes
  outcome: 'positive' | 'neutral' | 'negative';
  value: number; // potential revenue impact
}

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  avgLifetimeValue: number;
  conversionRate: number;
  avgJourneyTime: number; // days
  characteristics: string[];
  touchpoints: CustomerTouchpoint[];
}

interface JourneyInsight {
  id: string;
  type: 'bottleneck' | 'opportunity' | 'drop_off' | 'conversion_boost';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
  estimatedImprovement: number; // percentage
  stage: string;
  channel: string;
}

const CustomerJourneyAnalytics: React.FC = () => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [insights, setInsights] = useState<JourneyInsight[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [journeyData, setJourneyData] = useState<any[]>([]);

  useEffect(() => {
    const initializeJourneyData = () => {
      // Mock customer segments
      const mockSegments: CustomerSegment[] = [
        {
          id: 'segment-1',
          name: 'Luxury SUV Buyers',
          description: 'High-income customers interested in premium SUVs',
          size: 1250,
          avgLifetimeValue: 85000,
          conversionRate: 0.23,
          avgJourneyTime: 45,
          characteristics: ['High income', 'Brand conscious', 'Tech-savvy', 'Family-oriented'],
          touchpoints: [
            { id: 'tp1', stage: 'awareness', channel: 'social_media', action: 'Saw Instagram ad', timestamp: new Date(), duration: 2, outcome: 'positive', value: 0 },
            { id: 'tp2', stage: 'interest', channel: 'website', action: 'Viewed SUV models', timestamp: new Date(), duration: 15, outcome: 'positive', value: 5000 },
            { id: 'tp3', stage: 'consideration', channel: 'email', action: 'Downloaded brochure', timestamp: new Date(), duration: 5, outcome: 'positive', value: 10000 },
            { id: 'tp4', stage: 'purchase', channel: 'in_person', action: 'Test drive and purchase', timestamp: new Date(), duration: 120, outcome: 'positive', value: 75000 }
          ]
        },
        {
          id: 'segment-2',
          name: 'Budget-Conscious Buyers',
          description: 'Price-sensitive customers looking for value',
          size: 2100,
          avgLifetimeValue: 25000,
          conversionRate: 0.18,
          avgJourneyTime: 28,
          characteristics: ['Price sensitive', 'Research heavy', 'Comparison shoppers', 'Financing focused'],
          touchpoints: [
            { id: 'tp5', stage: 'awareness', channel: 'advertising', action: 'Saw Google ad', timestamp: new Date(), duration: 1, outcome: 'neutral', value: 0 },
            { id: 'tp6', stage: 'interest', channel: 'website', action: 'Compared prices', timestamp: new Date(), duration: 25, outcome: 'positive', value: 2000 },
            { id: 'tp7', stage: 'consideration', channel: 'phone', action: 'Called for financing info', timestamp: new Date(), duration: 20, outcome: 'positive', value: 8000 },
            { id: 'tp8', stage: 'purchase', channel: 'in_person', action: 'Negotiated and purchased', timestamp: new Date(), duration: 90, outcome: 'positive', value: 22000 }
          ]
        },
        {
          id: 'segment-3',
          name: 'First-Time Buyers',
          description: 'New car buyers with limited experience',
          size: 850,
          avgLifetimeValue: 35000,
          conversionRate: 0.15,
          avgJourneyTime: 60,
          characteristics: ['Inexperienced', 'Education seeking', 'Trust building', 'Support needed'],
          touchpoints: [
            { id: 'tp9', stage: 'awareness', channel: 'website', action: 'Found through search', timestamp: new Date(), duration: 3, outcome: 'positive', value: 0 },
            { id: 'tp10', stage: 'interest', channel: 'website', action: 'Read buying guides', timestamp: new Date(), duration: 45, outcome: 'positive', value: 3000 },
            { id: 'tp11', stage: 'consideration', channel: 'email', action: 'Subscribed to newsletter', timestamp: new Date(), duration: 2, outcome: 'positive', value: 6000 },
            { id: 'tp12', stage: 'purchase', channel: 'in_person', action: 'Consultation and purchase', timestamp: new Date(), duration: 180, outcome: 'positive', value: 32000 }
          ]
        }
      ];

      // Mock journey insights
      const mockInsights: JourneyInsight[] = [
        {
          id: 'insight-1',
          type: 'bottleneck',
          title: 'Consideration Stage Bottleneck',
          description: 'Customers spend 40% longer in the consideration stage than industry average, leading to higher drop-off rates.',
          impact: 'high',
          recommendation: 'Implement automated follow-up sequences and personalized content recommendations',
          estimatedImprovement: 25,
          stage: 'consideration',
          channel: 'email'
        },
        {
          id: 'insight-2',
          type: 'opportunity',
          title: 'Social Media Engagement Gap',
          description: 'High engagement on social media but low conversion to website visits. Opportunity to optimize social-to-web funnel.',
          impact: 'medium',
          recommendation: 'Add clear CTAs in social posts and improve landing page experience',
          estimatedImprovement: 15,
          stage: 'awareness',
          channel: 'social_media'
        },
        {
          id: 'insight-3',
          type: 'drop_off',
          title: 'Website Exit Points',
          description: 'Significant drop-off occurs on vehicle comparison pages. Users struggle to find relevant information.',
          impact: 'high',
          recommendation: 'Redesign comparison interface and add interactive features',
          estimatedImprovement: 30,
          stage: 'interest',
          channel: 'website'
        },
        {
          id: 'insight-4',
          type: 'conversion_boost',
          title: 'Phone Follow-up Success',
          description: 'Customers who receive phone follow-ups within 24 hours have 3x higher conversion rates.',
          impact: 'high',
          recommendation: 'Implement automated phone follow-up system for high-intent visitors',
          estimatedImprovement: 200,
          stage: 'consideration',
          channel: 'phone'
        }
      ];

      // Mock journey flow data
      const mockJourneyData = [
        { stage: 'Awareness', visitors: 10000, conversions: 2500, rate: 25 },
        { stage: 'Interest', visitors: 2500, conversions: 1200, rate: 48 },
        { stage: 'Consideration', visitors: 1200, conversions: 600, rate: 50 },
        { stage: 'Purchase', visitors: 600, conversions: 300, rate: 50 },
        { stage: 'Retention', visitors: 300, conversions: 240, rate: 80 }
      ];

      setSegments(mockSegments);
      setInsights(mockInsights);
      setJourneyData(mockJourneyData);
      setSelectedSegment(mockSegments[0].id);
    };

    initializeJourneyData();
  }, []);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness': return '#3b82f6';
      case 'interest': return '#8b5cf6';
      case 'consideration': return '#f59e0b';
      case 'purchase': return '#10b981';
      case 'retention': return '#ef4444';
      case 'advocacy': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'website': return '🌐';
      case 'social_media': return '📱';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'in_person': return '🏢';
      case 'advertising': return '📺';
      default: return '📊';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bottleneck': return '🚧';
      case 'opportunity': return '💡';
      case 'drop_off': return '📉';
      case 'conversion_boost': return '🚀';
      default: return '📊';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const selectedSegmentData = segments.find(s => s.id === selectedSegment);

  return (
    <div className="customer-journey-analytics">
      <h3>🛣️ Customer Journey Analytics</h3>
      <p>Map and optimize the complete customer journey from awareness to advocacy.</p>

      {/* Segment Selector */}
      <div className="segment-selector">
        <label>Customer Segment:</label>
        <select 
          value={selectedSegment} 
          onChange={(e) => setSelectedSegment(e.target.value)}
        >
          {segments.map(segment => (
            <option key={segment.id} value={segment.id}>
              {segment.name} ({segment.size} customers)
            </option>
          ))}
        </select>
      </div>

      {/* Journey Overview */}
      <div className="journey-overview">
        <h4>📊 Journey Overview</h4>
        <div className="overview-metrics">
          {selectedSegmentData && (
            <>
              <div className="metric-card">
                <h5>Segment Size</h5>
                <div className="metric-value">{selectedSegmentData.size.toLocaleString()}</div>
                <div className="metric-label">customers</div>
              </div>
              <div className="metric-card">
                <h5>Avg. Lifetime Value</h5>
                <div className="metric-value">${selectedSegmentData.avgLifetimeValue.toLocaleString()}</div>
                <div className="metric-label">per customer</div>
              </div>
              <div className="metric-card">
                <h5>Conversion Rate</h5>
                <div className="metric-value">{(selectedSegmentData.conversionRate * 100).toFixed(1)}%</div>
                <div className="metric-label">overall</div>
              </div>
              <div className="metric-card">
                <h5>Avg. Journey Time</h5>
                <div className="metric-value">{selectedSegmentData.avgJourneyTime}</div>
                <div className="metric-label">days</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Journey Funnel */}
      <div className="journey-funnel">
        <h4>🔄 Customer Journey Funnel</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={journeyData} layout="horizontal">
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" />
            <Tooltip />
            <Bar dataKey="visitors" fill="#3b82f6" name="Visitors" />
            <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Touchpoint Analysis */}
      <div className="touchpoint-analysis">
        <h4>📍 Touchpoint Analysis</h4>
        {selectedSegmentData && (
          <div className="touchpoints-timeline">
            {selectedSegmentData.touchpoints.map((touchpoint, index) => (
              <div key={touchpoint.id} className="touchpoint-item">
                <div className="touchpoint-connector">
                  {index < selectedSegmentData.touchpoints.length - 1 && (
                    <div className="connector-line" />
                  )}
                </div>
                <div className="touchpoint-content">
                  <div className="touchpoint-header">
                    <div className="stage-indicator" style={{ backgroundColor: getStageColor(touchpoint.stage) }}>
                      {touchpoint.stage}
                    </div>
                    <div className="channel-info">
                      <span className="channel-icon">{getChannelIcon(touchpoint.channel)}</span>
                      <span className="channel-name">{touchpoint.channel.replace('_', ' ')}</span>
                    </div>
                    <div className="duration-info">
                      {touchpoint.duration} min
                    </div>
                  </div>
                  <div className="touchpoint-details">
                    <h6>{touchpoint.action}</h6>
                    <div className="touchpoint-meta">
                      <span className={`outcome ${touchpoint.outcome}`}>
                        {touchpoint.outcome}
                      </span>
                      {touchpoint.value > 0 && (
                        <span className="value">${touchpoint.value.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Journey Insights */}
      <div className="journey-insights">
        <h4>💡 Journey Insights & Recommendations</h4>
        <div className="insights-grid">
          {insights.map(insight => (
            <div key={insight.id} className="insight-card">
              <div className="insight-header">
                <div className="insight-icon">{getInsightIcon(insight.type)}</div>
                <div className="insight-meta">
                  <span 
                    className="impact-badge" 
                    style={{ backgroundColor: getImpactColor(insight.impact) }}
                  >
                    {insight.impact} impact
                  </span>
                  <span className="improvement-badge">
                    +{insight.estimatedImprovement}% improvement
                  </span>
                </div>
              </div>
              
              <div className="insight-content">
                <h5>{insight.title}</h5>
                <p>{insight.description}</p>
                
                <div className="insight-details">
                  <div className="detail-item">
                    <strong>Stage:</strong> {insight.stage}
                  </div>
                  <div className="detail-item">
                    <strong>Channel:</strong> {insight.channel.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="recommendation">
                  <h6>Recommendation:</h6>
                  <p>{insight.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Performance */}
      <div className="channel-performance">
        <h4>📈 Channel Performance</h4>
        <div className="channels-grid">
          {['website', 'social_media', 'email', 'phone', 'in_person', 'advertising'].map(channel => {
            const channelTouchpoints = selectedSegmentData?.touchpoints.filter(tp => tp.channel === channel) || [];
            const avgDuration = channelTouchpoints.length > 0 
              ? channelTouchpoints.reduce((sum, tp) => sum + tp.duration, 0) / channelTouchpoints.length 
              : 0;
            const positiveOutcomes = channelTouchpoints.filter(tp => tp.outcome === 'positive').length;
            const conversionRate = channelTouchpoints.length > 0 
              ? (positiveOutcomes / channelTouchpoints.length) * 100 
              : 0;

            return (
              <div key={channel} className="channel-card">
                <div className="channel-header">
                  <span className="channel-icon">{getChannelIcon(channel)}</span>
                  <h5>{channel.replace('_', ' ')}</h5>
                </div>
                <div className="channel-metrics">
                  <div className="metric">
                    <span className="metric-label">Touchpoints</span>
                    <span className="metric-value">{channelTouchpoints.length}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg. Duration</span>
                    <span className="metric-value">{avgDuration.toFixed(1)}m</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Success Rate</span>
                    <span className="metric-value">{conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="channel-bar">
                  <div 
                    className="channel-fill" 
                    style={{ 
                      width: `${conversionRate}%`,
                      backgroundColor: conversionRate > 70 ? '#10b981' : conversionRate > 40 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Journey Optimization Actions */}
      <div className="optimization-actions">
        <h4>🎯 Journey Optimization Actions</h4>
        <div className="actions-grid">
          <div className="action-card">
            <h5>🚀 Implement Automation</h5>
            <p>Set up automated follow-up sequences for high-intent visitors</p>
            <button className="action-button">Configure Automation</button>
          </div>
          <div className="action-card">
            <h5>📱 Optimize Mobile Experience</h5>
            <p>Improve mobile journey flow and reduce friction points</p>
            <button className="action-button">Mobile Audit</button>
          </div>
          <div className="action-card">
            <h5>🎨 Personalize Content</h5>
            <p>Create dynamic content based on customer segment and behavior</p>
            <button className="action-button">Setup Personalization</button>
          </div>
          <div className="action-card">
            <h5>📊 A/B Test Journey</h5>
            <p>Test different journey flows to optimize conversion rates</p>
            <button className="action-button">Start Testing</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyAnalytics;
