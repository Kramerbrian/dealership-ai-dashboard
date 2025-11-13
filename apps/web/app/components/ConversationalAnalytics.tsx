"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

// Types
interface AIQuery {
  query: string;
  response: {
    visualization: ChartConfig;
    insights: string[];
    actions: SuggestedAction[];
    confidence: number;
  };
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  data: any[];
  xAxis: string;
  yAxis: string;
  title: string;
  description: string;
  colors?: string[];
}

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: () => void;
}

interface QueryHistory {
  id: string;
  query: string;
  timestamp: Date;
  response: AIQuery['response'];
}

// Mock data for demonstrations
const mockData = {
  seo: [
    { date: 'Oct 1', score: 82.1, traffic: 1200, leads: 45 },
    { date: 'Oct 8', score: 84.5, traffic: 1350, leads: 52 },
    { date: 'Oct 15', score: 87.3, traffic: 1480, leads: 61 },
    { date: 'Oct 22', score: 89.1, traffic: 1620, leads: 68 },
    { date: 'Oct 29', score: 87.3, traffic: 1580, leads: 65 }
  ],
  competitors: [
    { name: 'AutoMax Dealership', seo: 92.1, traffic: 2100, marketShare: 35 },
    { name: 'Premier Motors', seo: 88.7, traffic: 1800, marketShare: 28 },
    { name: 'Elite Auto Group', seo: 85.4, traffic: 1650, marketShare: 25 },
    { name: 'Your Dealership', seo: 87.3, traffic: 1580, marketShare: 12 }
  ],
  opportunities: [
    { name: 'FAQ Schema', impact: '+15%', effort: 'low', roi: 450 },
    { name: 'Local Business Schema', impact: '+8%', effort: 'medium', roi: 320 },
    { name: 'Review Response', impact: '+5%', effort: 'low', roi: 280 }
  ]
};

const ConversationalAnalytics = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<AIQuery['response'] | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [suggestedQueries] = useState([
    "Show me SEO trends for the last month",
    "Compare my performance with competitors",
    "What opportunities have the highest ROI?",
    "Why did my traffic drop last week?",
    "Show me conversion funnel analysis",
    "What's my market share vs competitors?"
  ]);

  const queryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on input when component mounts
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, []);

  const handleQuery = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    const queryText = query.trim();
    setQuery('');

    try {
      // Simulate AI processing
      const response = await processQuery(queryText);
      
      const newQuery: QueryHistory = {
        id: Date.now().toString(),
        query: queryText,
        timestamp: new Date(),
        response: response
      };

      setQueryHistory(prev => [newQuery, ...prev.slice(0, 9)]); // Keep last 10 queries
      setCurrentResult(response);
      
      toast.success('Query processed successfully!');
    } catch (error) {
      toast.error('Failed to process query. Please try again.');
      console.error('Query processing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processQuery = async (queryText: string): Promise<AIQuery['response']> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerQuery = queryText.toLowerCase();
    
    // SEO Trends Query
    if (lowerQuery.includes('seo') && (lowerQuery.includes('trend') || lowerQuery.includes('month'))) {
      return {
        visualization: {
          type: 'line',
          data: mockData.seo,
          xAxis: 'date',
          yAxis: 'score',
          title: 'SEO Score Trends (Last Month)',
          description: 'Your SEO visibility has been steadily improving over the past month',
          colors: ['#2196F3', '#ff9800', '#f44336']
        },
        insights: [
          'SEO score increased by 5.2% over the month',
          'Traffic growth of 31.7% correlates with SEO improvements',
          'Lead generation increased by 44.4% during this period'
        ],
        actions: [
          {
            id: 'seo-optimization',
            title: 'Continue SEO Optimization',
            description: 'Maintain current SEO strategy',
            impact: 'High',
            effort: 'medium',
            priority: 'high',
            action: () => toast.success('SEO optimization strategy maintained')
          }
        ],
        confidence: 0.92
      };
    }

    // Competitor Comparison Query
    if (lowerQuery.includes('competitor') || lowerQuery.includes('compare')) {
      return {
        visualization: {
          type: 'bar',
          data: mockData.competitors,
          xAxis: 'name',
          yAxis: 'seo',
          title: 'SEO Score Comparison',
          description: 'Your dealership ranks 2nd in SEO performance among local competitors',
          colors: ['#2196F3', '#ff9800', '#f44336', '#4caf50']
        },
        insights: [
          'You rank 2nd out of 4 competitors in SEO',
          'AutoMax leads with 92.1% SEO score',
          'You have 4.6% growth potential to catch the leader',
          'Market share is 12% - significant growth opportunity'
        ],
        actions: [
          {
            id: 'competitor-analysis',
            title: 'Analyze AutoMax Strategy',
            description: 'Study top competitor\'s SEO approach',
            impact: 'High',
            effort: 'medium',
            priority: 'high',
            action: () => toast.success('Competitor analysis initiated')
          }
        ],
        confidence: 0.88
      };
    }

    // ROI Opportunities Query
    if (lowerQuery.includes('opportunity') || lowerQuery.includes('roi')) {
      return {
        visualization: {
          type: 'bar',
          data: mockData.opportunities,
          xAxis: 'name',
          yAxis: 'roi',
          title: 'Opportunity ROI Analysis',
          description: 'FAQ Schema offers the highest ROI with minimal effort',
          colors: ['#4caf50', '#ff9800', '#f44336']
        },
        insights: [
          'FAQ Schema has 450% ROI with low effort',
          'All opportunities have positive ROI',
          'Focus on low-effort, high-impact opportunities first',
          'Combined implementation could increase revenue by 28%'
        ],
        actions: [
          {
            id: 'deploy-faq-schema',
            title: 'Deploy FAQ Schema',
            description: 'Implement FAQ schema for maximum ROI',
            impact: 'High',
            effort: 'low',
            priority: 'critical',
            action: () => toast.success('FAQ Schema deployment initiated')
          }
        ],
        confidence: 0.95
      };
    }

    // Traffic Analysis Query
    if (lowerQuery.includes('traffic') && lowerQuery.includes('drop')) {
      return {
        visualization: {
          type: 'line',
          data: mockData.seo,
          xAxis: 'date',
          yAxis: 'traffic',
          title: 'Traffic Analysis',
          description: 'Traffic actually increased overall, with a minor dip in the last week',
          colors: ['#2196F3']
        },
        insights: [
          'Traffic increased 31.7% over the month',
          'Last week showed 2.5% decrease from peak',
          'This is likely seasonal variation, not a trend',
          'SEO score remained stable during traffic dip'
        ],
        actions: [
          {
            id: 'traffic-monitoring',
            title: 'Monitor Traffic Closely',
            description: 'Set up alerts for traffic changes',
            impact: 'Medium',
            effort: 'low',
            priority: 'medium',
            action: () => toast.success('Traffic monitoring alerts configured')
          }
        ],
        confidence: 0.87
      };
    }

    // Conversion Funnel Query
    if (lowerQuery.includes('conversion') || lowerQuery.includes('funnel')) {
      const funnelData = [
        { stage: 'Impressions', value: 45000, color: '#e3f2fd' },
        { stage: 'Clicks', value: 3200, color: '#90caf9' },
        { stage: 'Visits', value: 2800, color: '#42a5f5' },
        { stage: 'Leads', value: 420, color: '#1976d2' },
        { stage: 'Sales', value: 180, color: '#0d47a1' }
      ];

      return {
        visualization: {
          type: 'bar',
          data: funnelData,
          xAxis: 'stage',
          yAxis: 'value',
          title: 'Conversion Funnel Analysis',
          description: 'Your conversion rate from visits to sales is 6.4%',
          colors: ['#e3f2fd', '#90caf9', '#42a5f5', '#1976d2', '#0d47a1']
        },
        insights: [
          'Overall conversion rate: 0.4% (impressions to sales)',
          'Visit to lead conversion: 15%',
          'Lead to sale conversion: 42.9%',
          'Biggest drop-off: impressions to clicks (7.1%)'
        ],
        actions: [
          {
            id: 'optimize-ctr',
            title: 'Optimize Click-Through Rate',
            description: 'Improve ad copy and targeting',
            impact: 'High',
            effort: 'medium',
            priority: 'high',
            action: () => toast.success('CTR optimization strategy initiated')
          }
        ],
        confidence: 0.91
      };
    }

    // Market Share Query
    if (lowerQuery.includes('market share')) {
      const marketData = mockData.competitors.map(comp => ({
        name: comp.name,
        value: comp.marketShare,
        color: comp.name === 'Your Dealership' ? '#4caf50' : '#2196F3'
      }));

      return {
        visualization: {
          type: 'pie',
          data: marketData,
          xAxis: 'name',
          yAxis: 'value',
          title: 'Market Share Distribution',
          description: 'You hold 12% market share with room for significant growth',
          colors: ['#4caf50', '#2196F3', '#ff9800', '#f44336']
        },
        insights: [
          'Your market share: 12%',
          'AutoMax leads with 35% market share',
          'Growth potential: 23% to reach market leader',
          'Focus on SEO and local presence to gain share'
        ],
        actions: [
          {
            id: 'market-expansion',
            title: 'Expand Market Presence',
            description: 'Increase local marketing efforts',
            impact: 'High',
            effort: 'high',
            priority: 'high',
            action: () => toast.success('Market expansion strategy launched')
          }
        ],
        confidence: 0.89
      };
    }

    // Default response for unrecognized queries
    return {
      visualization: {
        type: 'line',
        data: mockData.seo,
        xAxis: 'date',
        yAxis: 'score',
        title: 'SEO Performance Overview',
        description: 'Here\'s your current SEO performance trend',
        colors: ['#2196F3']
      },
      insights: [
        'Your SEO score is 87.3%, which is above average',
        'Traffic has been growing steadily',
        'Consider asking more specific questions for detailed analysis'
      ],
      actions: [
        {
          id: 'general-optimization',
          title: 'General Optimization',
          description: 'Continue current optimization strategy',
          impact: 'Medium',
          effort: 'medium',
          priority: 'medium',
          action: () => toast.success('Optimization strategy maintained')
        }
      ],
      confidence: 0.75
    };
  };

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  };

  const renderVisualization = (config: ChartConfig) => {
    const commonProps = {
      data: config.data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={config.yAxis} 
                stroke={config.colors?.[0] || '#2196F3'} 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey={config.yAxis} 
                fill={config.colors?.[0] || '#2196F3'} 
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {config.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config.colors?.[index] || '#2196F3'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="conversational-analytics">
      <div className="analytics-header">
        <h2>🤖 Conversational Analytics</h2>
        <p>Ask questions about your data in natural language</p>
      </div>

      {/* Query Input */}
      <div className="query-input-section">
        <div className="query-input-container">
          <input
            ref={queryInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            placeholder="Ask anything: 'Show me SEO trends for competitors in my area'"
            className="query-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleQuery}
            disabled={!query.trim() || isLoading}
            className="query-button"
          >
            {isLoading ? '⏳' : '🔍'}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="suggested-queries">
          <h4>Try asking:</h4>
          <div className="suggestions-grid">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuery(suggestion)}
                className="suggestion-chip"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Result */}
      {currentResult && (
        <div className="query-result">
          <div className="result-header">
            <h3>{currentResult.visualization.title}</h3>
            <div className="confidence-badge">
              Confidence: {(currentResult.confidence * 100).toFixed(0)}%
            </div>
          </div>
          
          <p className="result-description">
            {currentResult.visualization.description}
          </p>

          {/* Visualization */}
          <div className="visualization-container">
            {renderVisualization(currentResult.visualization)}
          </div>

          {/* Insights */}
          <div className="insights-section">
            <h4>Key Insights</h4>
            <ul className="insights-list">
              {currentResult.insights.map((insight, index) => (
                <li key={index} className="insight-item">
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Actions */}
          {currentResult.actions.length > 0 && (
            <div className="actions-section">
              <h4>Recommended Actions</h4>
              <div className="actions-grid">
                {currentResult.actions.map((action) => (
                  <div key={action.id} className="action-card">
                    <div className="action-header">
                      <h5>{action.title}</h5>
                      <div className="action-badges">
                        <span className={`priority-badge ${action.priority}`}>
                          {action.priority}
                        </span>
                        <span className={`effort-badge ${action.effort}`}>
                          {action.effort} effort
                        </span>
                      </div>
                    </div>
                    <p className="action-description">{action.description}</p>
                    <div className="action-impact">Impact: {action.impact}</div>
                    <button 
                      onClick={action.action}
                      className="action-button"
                    >
                      Execute Action
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div className="query-history">
          <h4>Recent Queries</h4>
          <div className="history-list">
            {queryHistory.map((item) => (
              <div 
                key={item.id} 
                className="history-item"
                onClick={() => setCurrentResult(item.response)}
              >
                <div className="history-query">{item.query}</div>
                <div className="history-time">
                  {item.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationalAnalytics;
