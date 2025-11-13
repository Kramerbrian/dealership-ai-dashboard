'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import toast from 'react-hot-toast';

interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'seo' | 'traffic' | 'conversion' | 'competition' | 'revenue';
  actionable: boolean;
  suggestedActions: string[];
  timeframe: string;
  data: any[];
}

interface SmartAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  category: string;
  timestamp: Date;
  resolved: boolean;
  autoResolved: boolean;
}

const SmartAnalytics: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Generate AI insights
  useEffect(() => {
    const generateInsights = () => {
      const mockInsights: AIInsight[] = [
        {
          id: 'insight-1',
          type: 'trend',
          title: 'Rising Competitor Threat',
          description: 'AutoMax dealership has increased their local SEO presence by 23% in the last 7 days, potentially impacting your market share.',
          confidence: 0.87,
          impact: 'high',
          category: 'competition',
          actionable: true,
          suggestedActions: [
            'Increase local SEO budget by 15%',
            'Monitor AutoMax\'s new content strategy',
            'Accelerate local listing optimization'
          ],
          timeframe: '7 days',
          data: [
            { day: 'Mon', yourScore: 87, competitorScore: 72 },
            { day: 'Tue', yourScore: 88, competitorScore: 75 },
            { day: 'Wed', yourScore: 89, competitorScore: 78 },
            { day: 'Thu', yourScore: 87, competitorScore: 81 },
            { day: 'Fri', yourScore: 88, competitorScore: 84 },
            { day: 'Sat', yourScore: 89, competitorScore: 87 },
            { day: 'Sun', yourScore: 90, competitorScore: 89 }
          ]
        },
        {
          id: 'insight-2',
          type: 'anomaly',
          title: 'Unusual Traffic Pattern Detected',
          description: 'Website traffic spiked by 340% on Tuesday 2-4 PM, likely due to a viral social media mention. This pattern is 4x above normal.',
          confidence: 0.94,
          impact: 'medium',
          category: 'traffic',
          actionable: true,
          suggestedActions: [
            'Investigate the traffic source',
            'Prepare for potential server load',
            'Capitalize on increased visibility'
          ],
          timeframe: '24 hours',
          data: [
            { hour: '00:00', traffic: 45 },
            { hour: '04:00', traffic: 38 },
            { hour: '08:00', traffic: 120 },
            { hour: '12:00', traffic: 180 },
            { hour: '14:00', traffic: 1200 },
            { hour: '16:00', traffic: 850 },
            { hour: '20:00', traffic: 200 }
          ]
        },
        {
          id: 'insight-3',
          type: 'prediction',
          title: 'Revenue Forecast',
          description: 'Based on current trends, your Q4 revenue is projected to increase by 18% compared to Q3, reaching $2.4M.',
          confidence: 0.82,
          impact: 'high',
          category: 'revenue',
          actionable: true,
          suggestedActions: [
            'Plan inventory for increased demand',
            'Scale marketing efforts',
            'Prepare for higher operational costs'
          ],
          timeframe: '3 months',
          data: [
            { month: 'Jul', actual: 1800000, predicted: 1800000 },
            { month: 'Aug', actual: 1950000, predicted: 1950000 },
            { month: 'Sep', actual: 2100000, predicted: 2100000 },
            { month: 'Oct', predicted: 2250000 },
            { month: 'Nov', predicted: 2350000 },
            { month: 'Dec', predicted: 2400000 }
          ]
        },
        {
          id: 'insight-4',
          type: 'recommendation',
          title: 'SEO Opportunity Identified',
          description: 'Long-tail keyword "luxury SUV deals near me" has low competition but high search volume. You could capture 40% of this traffic.',
          confidence: 0.91,
          impact: 'medium',
          category: 'seo',
          actionable: true,
          suggestedActions: [
            'Create targeted landing page',
            'Optimize existing SUV content',
            'Launch local SEO campaign'
          ],
          timeframe: '2 weeks',
          data: [
            { keyword: 'luxury SUV deals', volume: 1200, competition: 0.3, opportunity: 0.8 },
            { keyword: 'SUV deals near me', volume: 800, competition: 0.4, opportunity: 0.7 },
            { keyword: 'best SUV deals', volume: 1500, competition: 0.6, opportunity: 0.5 }
          ]
        }
      ];
      setInsights(mockInsights);
    };

    generateInsights();
  }, []);

  // Generate smart alerts
  useEffect(() => {
    const generateAlerts = () => {
      const mockAlerts: SmartAlert[] = [
        {
          id: 'alert-1',
          severity: 'warning',
          title: 'Conversion Rate Drop',
          message: 'Website conversion rate dropped by 12% in the last 24 hours. This could impact monthly revenue targets.',
          category: 'conversion',
          timestamp: new Date(Date.now() - 3600000),
          resolved: false,
          autoResolved: false
        },
        {
          id: 'alert-2',
          severity: 'info',
          title: 'New Competitor Detected',
          message: 'Elite Motors has launched a new local SEO campaign targeting your primary keywords.',
          category: 'competition',
          timestamp: new Date(Date.now() - 7200000),
          resolved: false,
          autoResolved: false
        },
        {
          id: 'alert-3',
          severity: 'critical',
          title: 'Server Performance Issue',
          message: 'Page load times increased by 300% due to high traffic. Immediate action required.',
          category: 'performance',
          timestamp: new Date(Date.now() - 1800000),
          resolved: true,
          autoResolved: true
        }
      ];
      setAlerts(mockAlerts);
    };

    generateAlerts();
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    toast.loading('Running AI analysis...', { id: 'analysis' });
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Analysis complete! Found 3 new insights.', { id: 'analysis' });
    setIsAnalyzing(false);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    toast.success('Alert resolved');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'error': return '#f97316';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo': return '🔍';
      case 'traffic': return '📈';
      case 'conversion': return '💰';
      case 'competition': return '🏆';
      case 'revenue': return '💵';
      default: return '📊';
    }
  };

  return (
    <div className="smart-analytics">
      <h3>🧠 Smart Analytics & AI Insights</h3>
      <p>AI-powered analytics that automatically detects patterns, predicts trends, and provides actionable recommendations.</p>

      {/* Analysis Controls */}
      <div className="analysis-controls">
        <div className="timeframe-selector">
          <label>Analysis Timeframe:</label>
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="analyze-button"
        >
          {isAnalyzing ? '🔄 Analyzing...' : '🚀 Run AI Analysis'}
        </button>
      </div>

      {/* Smart Alerts */}
      <div className="smart-alerts">
        <h4>🚨 Smart Alerts</h4>
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card ${alert.severity} ${alert.resolved ? 'resolved' : ''}`}>
              <div className="alert-header">
                <div className="alert-severity" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
                  {alert.severity.toUpperCase()}
                </div>
                <div className="alert-meta">
                  <span className="alert-category">{alert.category}</span>
                  <span className="alert-time">
                    {alert.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="alert-content">
                <h5>{alert.title}</h5>
                <p>{alert.message}</p>
              </div>
              <div className="alert-actions">
                {!alert.resolved && (
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="resolve-button"
                  >
                    Mark as Resolved
                  </button>
                )}
                {alert.autoResolved && (
                  <span className="auto-resolved">🤖 Auto-resolved</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights">
        <h4>💡 AI Insights</h4>
        <div className="insights-grid">
          {insights.map(insight => (
            <div key={insight.id} className="insight-card">
              <div className="insight-header">
                <div className="insight-type">
                  <span className="category-icon">{getCategoryIcon(insight.category)}</span>
                  <span className="type-badge">{insight.type}</span>
                </div>
                <div className="insight-confidence">
                  <span className="confidence-score">
                    {Math.round(insight.confidence * 100)}%
                  </span>
                  <span className="confidence-label">confidence</span>
                </div>
              </div>
              
              <div className="insight-content">
                <h5>{insight.title}</h5>
                <p>{insight.description}</p>
                
                <div className="insight-meta">
                  <span 
                    className="impact-badge" 
                    style={{ backgroundColor: getImpactColor(insight.impact) }}
                  >
                    {insight.impact} impact
                  </span>
                  <span className="timeframe">{insight.timeframe}</span>
                </div>
              </div>

              {insight.actionable && (
                <div className="suggested-actions">
                  <h6>Suggested Actions:</h6>
                  <ul>
                    {insight.suggestedActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="insight-chart">
                {insight.type === 'trend' && (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={insight.data}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="yourScore" stroke="#3b82f6" name="Your Score" />
                      <Line type="monotone" dataKey="competitorScore" stroke="#ef4444" name="Competitor" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                
                {insight.type === 'anomaly' && (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={insight.data}>
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="traffic" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {insight.type === 'prediction' && (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={insight.data}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" />
                      <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeDasharray="5 5" name="Predicted" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                
                {insight.type === 'recommendation' && (
                  <ResponsiveContainer width="100%" height={150}>
                    <ScatterChart data={insight.data}>
                      <XAxis dataKey="competition" />
                      <YAxis dataKey="volume" />
                      <Tooltip />
                      <Scatter dataKey="opportunity" fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <h4>📊 Performance Summary</h4>
        <div className="summary-grid">
          <div className="summary-card">
            <h5>Insights Generated</h5>
            <div className="summary-value">{insights.length}</div>
            <div className="summary-trend">+12% this week</div>
          </div>
          <div className="summary-card">
            <h5>Alerts Resolved</h5>
            <div className="summary-value">{alerts.filter(a => a.resolved).length}</div>
            <div className="summary-trend">85% auto-resolved</div>
          </div>
          <div className="summary-card">
            <h5>Actionable Insights</h5>
            <div className="summary-value">{insights.filter(i => i.actionable).length}</div>
            <div className="summary-trend">92% accuracy</div>
          </div>
          <div className="summary-card">
            <h5>Avg. Confidence</h5>
            <div className="summary-value">
              {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length * 100)}%
            </div>
            <div className="summary-trend">High reliability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAnalytics;
