"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { unparse } from 'papaparse';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import "./dashboard-enhanced.css";
import "./conversational-analytics.css";
import "./predictive-opportunity-engine.css";
import "./autopilot-mode.css";
import "./competitor-landscape-3d.css";
import "./cohort-analysis.css";
import "./advanced-filtering.css";
import "./gamification-system.css";
import "./team-collaboration.css";
import "./workflow-builder.css";
import "./voice-commands.css";
import "./advanced-personalization.css";
import "./micro-frontend-architecture.css";
import "./performance-optimizer.css";
import "./smart-analytics.css";
import "./security-compliance.css";
import "./customer-journey-analytics.css";
import "./api-integration-hub.css";
import "./data-import-export.css";
import "./marketing-platform-integration.css";
import "./geo-dashboard.css";
import ConversationalAnalytics from './ConversationalAnalytics';
import PredictiveOpportunityEngine from './PredictiveOpportunityEngine';
import AutoPilotMode from './AutoPilotMode';
import AEOMock from './AEOMock';
import CompetitorLandscape3D from './CompetitorLandscape3D';
import CohortAnalysis from './CohortAnalysis';
import AdvancedFiltering from './AdvancedFiltering';
import GamificationSystem from './GamificationSystem';
import TeamCollaboration from './TeamCollaboration';
import WorkflowBuilder from './WorkflowBuilder';
import VoiceCommands from './VoiceCommands';
import AdvancedPersonalization from './AdvancedPersonalization';
import MicroFrontendArchitecture from './MicroFrontendArchitecture';
import PerformanceOptimizer from './PerformanceOptimizer';
import SmartAnalytics from './SmartAnalytics';
import SecurityCompliance from './SecurityCompliance';
import CustomerJourneyAnalytics from './CustomerJourneyAnalytics';
import APIIntegrationHub from './APIIntegrationHub';
import DataImportExport from './DataImportExport';
import MarketingPlatformIntegration from './MarketingPlatformIntegration';
import GeoAuditCard from './geo/GeoAuditCard';
import AiOverviewImpact from './geo/AiOverviewImpact';
import MaximusCommandConsole from '@/components/dashboard/MaximusCommandConsole';
import CompetitiveAdvantageDashboard from '@/components/dashboard/CompetitiveAdvantageDashboard';

// Types
interface UserPreferences {
  darkMode: boolean;
  lastTab: string;
  layout: any[];
  notifications: boolean;
}

interface Event {
  id: string;
  type: 'deployment' | 'alert' | 'review' | 'competitor';
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Filters {
  dateRange: { start: Date; end: Date };
  metrics: string[];
  locations: string[];
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're working to fix this issue.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Skeleton Loader Component
const Skeleton = () => (
  <div className="skeleton-loader">
    <div className="skeleton-line" style={{ width: '60%' }}></div>
    <div className="skeleton-line" style={{ width: '80%' }}></div>
    <div className="skeleton-line" style={{ width: '40%' }}></div>
  </div>
);

// Utility function for event icons
const getEventIcon = (type: string) => {
  const icons = {
    deployment: '🚀',
    alert: '🔔',
    review: '⭐',
    competitor: '🏆'
  };
  return icons[type as keyof typeof icons] || '📊';
};

// Utility function for relative time
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Activity Feed Component
const ActivityFeed = ({ events }: { events: Event[] }) => (
  <div className="activity-feed">
    <h3>Recent Activity</h3>
    {events.map(event => (
      <div key={event.id} className={`event-item ${event.severity}`}>
        <div className="event-icon">{getEventIcon(event.type)}</div>
        <div className="event-content">
          <p>{event.message}</p>
          <span className="text-sm">{formatRelativeTime(event.timestamp)}</span>
        </div>
      </div>
    ))}
  </div>
);

// Chat Assistant Component
const ChatAssistant = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you analyze your dealership data. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: 'dashboard'
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <h3>AI Assistant</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="message assistant">Thinking...</div>}
      </div>
      <div className="chat-input">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your metrics..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({ onFilterChange }: { onFilterChange: (filters: Filters) => void }) => {
  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
    metrics: ['SEO', 'AEO', 'GEO'],
    locations: ['All']
  });

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="filter-panel">
      <h4>Filters</h4>
      <div className="filter-group">
        <label>Date Range</label>
        <input 
          type="date" 
          value={filters.dateRange.start.toISOString().split('T')[0]}
          onChange={e => handleFilterChange({
            dateRange: { ...filters.dateRange, start: new Date(e.target.value) }
          })}
        />
        <input 
          type="date" 
          value={filters.dateRange.end.toISOString().split('T')[0]}
          onChange={e => handleFilterChange({
            dateRange: { ...filters.dateRange, end: new Date(e.target.value) }
          })}
        />
      </div>
      <div className="filter-group">
        <label>Metrics</label>
        {['SEO', 'AEO', 'GEO'].map(metric => (
          <label key={metric}>
            <input 
              type="checkbox" 
              checked={filters.metrics.includes(metric)}
              onChange={e => {
                const newMetrics = e.target.checked 
                  ? [...filters.metrics, metric]
                  : filters.metrics.filter(m => m !== metric);
                handleFilterChange({ metrics: newMetrics });
              }}
            />
            {metric}
          </label>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const DealershipAIDashboardEnhanced = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [layout, setLayout] = useState([
    { i: 'seo', x: 0, y: 0, w: 4, h: 2 },
    { i: 'aeo', x: 4, y: 0, w: 4, h: 2 },
    { i: 'geo', x: 8, y: 0, w: 4, h: 2 },
    { i: 'chart', x: 0, y: 2, w: 8, h: 3 },
    { i: 'activity', x: 8, y: 2, w: 4, h: 3 }
  ]);
  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
    metrics: ['SEO', 'AEO', 'GEO'],
    locations: ['All']
  });

  // Mock data
  const [metrics, setMetrics] = useState({
    seo: 87.3,
    aeo: 73.8,
    geo: 65.2,
    piqr: 92.1,
    hrp: 0.12,
    qai: 78.9
  });

  const [chartData] = useState([
    { date: 'Oct 1', seo: 82.1, aeo: 68.4, geo: 61.2 },
    { date: 'Oct 8', seo: 84.5, aeo: 70.2, geo: 63.1 },
    { date: 'Oct 15', seo: 87.3, aeo: 73.8, geo: 65.2 },
    { date: 'Oct 22', seo: 89.1, aeo: 75.4, geo: 67.8 },
    { date: 'Oct 29', seo: 87.3, aeo: 73.8, geo: 65.2 }
  ]);

  const [events] = useState<Event[]>([
    {
      id: '1',
      type: 'deployment',
      message: 'FAQ Schema deployed successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: 'success'
    },
    {
      id: '2',
      type: 'alert',
      message: 'SEO score increased by 2.1%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'info'
    },
    {
      id: '3',
      type: 'competitor',
      message: 'Competitor launched new service page',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: 'warning'
    }
  ]);

  // Load preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-prefs');
    if (saved) {
      try {
        const prefs: UserPreferences = JSON.parse(saved);
        setDarkMode(prefs.darkMode);
        setActiveTab(prefs.lastTab);
        if (prefs.layout) setLayout(prefs.layout);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  // Save preferences when they change
  const savePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    const current = JSON.parse(localStorage.getItem('dashboard-prefs') || '{}');
    const updated = { ...current, ...prefs };
    localStorage.setItem('dashboard-prefs', JSON.stringify(updated));
  }, []);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    savePreferences({ lastTab: tab });
    toast.success(`Switched to ${tab} tab`);
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    savePreferences({ darkMode: newMode });
    toast.success(`Switched to ${newMode ? 'dark' : 'light'} mode`);
  };

  // Handle layout change
  const handleLayoutChange = (newLayout: any[]) => {
    setLayout(newLayout);
    savePreferences({ layout: newLayout });
  };

  // Export functions
  const exportToPDF = () => {
    toast.loading('Generating PDF...');
    
    const doc = new jsPDF();
    doc.text('DealershipAI Dashboard Report', 14, 20);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    autoTable(doc, {
      head: [['Metric', 'Score', 'Change']],
      body: [
        ['SEO Visibility', `${metrics.seo}%`, '+12%'],
        ['AEO Visibility', `${metrics.aeo}%`, '+8%'],
        ['GEO Visibility', `${metrics.geo}%`, '+3%'],
        ['PIQR Score', `${metrics.piqr}%`, '+5%'],
        ['HRP Score', `${metrics.hrp}%`, '-2%'],
        ['QAI Score', `${metrics.qai}%`, '+7%']
      ]
    });
    
    doc.save('dashboard-report.pdf');
    toast.success('PDF exported successfully!');
  };

  const exportToCSV = () => {
    toast.loading('Generating CSV...');
    
    const csvData = chartData.map(row => ({
      Date: row.date,
      'SEO Score': row.seo,
      'AEO Score': row.aeo,
      'GEO Score': row.geo
    }));
    
    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metrics.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully!');
  };

  // Deploy opportunity with toast
  const deployOpportunity = async (type: string) => {
    toast.loading(`Deploying ${type}...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`${type} deployed successfully!`);
  };

  // Fetch data with loading state
  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update metrics with new data
      setMetrics(prev => ({
        ...prev,
        seo: prev.seo + (Math.random() - 0.5) * 2,
        aeo: prev.aeo + (Math.random() - 0.5) * 2,
        geo: prev.geo + (Math.random() - 0.5) * 2
      }));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions are now defined at the top level

    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'aeo', label: 'AEO', icon: '🤖' },
      { id: 'geo', label: 'GEO', icon: '🎯' },
      { id: 'conversational', label: 'AI Chat', icon: '💬' },
      { id: 'predictive', label: 'Predictions', icon: '🔮' },
      { id: 'autopilot', label: 'Auto-Pilot', icon: '🚀' },
      { id: 'smart-analytics', label: 'Smart Analytics', icon: '🧠' },
      { id: 'customer-journey', label: 'Customer Journey', icon: '🛣️' },
      { id: 'security', label: 'Security', icon: '🔒' },
      { id: 'performance', label: 'Performance', icon: '⚡' },
      { id: 'api-integrations', label: 'API Integrations', icon: '🔌' },
      { id: 'data-import-export', label: 'Data Import/Export', icon: '📥📤' },
      { id: 'marketing-platforms', label: 'Marketing Platforms', icon: '📢' },
      { id: '3d-landscape', label: '3D Landscape', icon: '🌐' },
      { id: 'cohort-analysis', label: 'Cohort Analysis', icon: '📈' },
      { id: 'filtering', label: 'Advanced Filters', icon: '🔍' },
      { id: 'gamification', label: 'Gamification', icon: '🎮' },
      { id: 'collaboration', label: 'Team Collaboration', icon: '👥' },
      { id: 'workflow', label: 'Workflow Builder', icon: '🔧' },
    { id: 'voice-commands', label: 'Voice & AR', icon: '🎤' },
    { id: 'personalization', label: 'Personalization', icon: '🎯' },
    { id: 'micro-frontend', label: 'Architecture', icon: '🏗️' },
    { id: 'competitive-advantage', label: 'Competitive Edge', icon: '🏆' },
      { id: 'ai-health', label: 'AI Health', icon: '⚡' },
      { id: 'opportunities', label: 'Opportunities', icon: '💡' },
      { id: 'competitors', label: 'Competitors', icon: '🏆' },
      { id: 'reviews', label: 'Reviews', icon: '⭐' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

  return (
    <ErrorBoundary>
      <div className={`dashboard-enhanced ${darkMode ? 'dark' : ''}`}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>DealershipAI Dashboard</h1>
            <span className="version">v2.0 Enhanced</span>
          </div>
          <div className="header-right">
            <button onClick={fetchData} disabled={loading}>
              {loading ? '🔄' : '🔄'} Refresh
            </button>
            <button onClick={toggleDarkMode}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setChatOpen(true)}>
              💬 AI Assistant
            </button>
            <button onClick={exportToPDF}>📄 PDF</button>
            <button onClick={exportToCSV}>📊 CSV</button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="dashboard-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <FilterPanel onFilterChange={setFilters} />
              
              {/* MAXIMUS Command Console */}
              <div className="mb-6">
                <MaximusCommandConsole />
              </div>
              
              {loading ? (
                <Skeleton />
              ) : (
                <GridLayout
                  className="layout"
                  layout={layout}
                  cols={12}
                  rowHeight={100}
                  width={1200}
                  onLayoutChange={handleLayoutChange}
                >
                  <div key="seo" className="metric-card">
                    <h3>SEO Visibility</h3>
                    <div className="metric-value">{metrics.seo.toFixed(1)}%</div>
                    <div className="metric-change positive">+12%</div>
                  </div>
                  
                  <div key="aeo" className="metric-card">
                    <h3>AEO Visibility</h3>
                    <div className="metric-value">{metrics.aeo.toFixed(1)}%</div>
                    <div className="metric-change positive">+8%</div>
                  </div>
                  
                  <div key="geo" className="metric-card">
                    <h3>GEO Visibility</h3>
                    <div className="metric-value">{metrics.geo.toFixed(1)}%</div>
                    <div className="metric-change positive">+3%</div>
                  </div>
                  
                  <div key="chart" className="chart-card">
                    <h3>Historical Trends</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="seo" stroke="#2196F3" strokeWidth={2} />
                        <Line type="monotone" dataKey="aeo" stroke="#ff9800" strokeWidth={2} />
                        <Line type="monotone" dataKey="geo" stroke="#f44336" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div key="activity" className="activity-card">
                    <ActivityFeed events={events} />
                  </div>
                </GridLayout>
              )}
            </div>
          )}

          {activeTab === 'aeo' && (
            <div className="tab-content">
              <AEOMock />
            </div>
          )}

          {activeTab === 'geo' && (
            <div className="tab-content">
              <div className="geo-dashboard">
                <div className="geo-header">
                  <h2>Generative Engine Optimization (GEO)</h2>
                  <p className="geo-subtitle">
                    Combat AI Overview traffic siphon with strategic optimization
                  </p>
                </div>
                
                <div className="geo-grid">
                  <div className="geo-main">
                    <AiOverviewImpact />
                  </div>
                  <div className="geo-sidebar">
                    <GeoAuditCard />
                  </div>
                </div>
                
                <div className="geo-insights">
                  <h3>GEO Strategy Insights</h3>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <h4>🚨 Critical Alert</h4>
                      <p>AI Overviews are siphoning 34.5% of your organic traffic. Immediate action required.</p>
                    </div>
                    <div className="insight-card">
                      <h4>📊 Opportunity</h4>
                      <p>Implement structured data to increase AI citation rate from 8.2% to 40%+.</p>
                    </div>
                    <div className="insight-card">
                      <h4>💰 Revenue Impact</h4>
                      <p>GEO optimization could recover $28,750/month in lost revenue.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conversational' && (
            <div className="tab-content">
              <ConversationalAnalytics />
            </div>
          )}

          {activeTab === 'predictive' && (
            <div className="tab-content">
              <PredictiveOpportunityEngine />
            </div>
          )}

          {activeTab === 'autopilot' && (
            <div className="tab-content">
              <AutoPilotMode />
            </div>
          )}

          {activeTab === 'ai-health' && (
            <div className="tab-content">
              <h2>AI Health Monitoring</h2>
              <div className="health-grid">
                <div className="health-card">
                  <h3>Model Accuracy</h3>
                  <div className="health-value">94.2%</div>
                  <div className="health-status good">Excellent</div>
                </div>
                <div className="health-card">
                  <h3>Data Quality</h3>
                  <div className="health-value">87.5%</div>
                  <div className="health-status good">Good</div>
                </div>
                <div className="health-card">
                  <h3>Response Time</h3>
                  <div className="health-value">1.2s</div>
                  <div className="health-status warning">Slow</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="tab-content">
              <h2>AI Opportunities</h2>
              <div className="opportunities-grid">
                <div className="opportunity-card">
                  <h3>FAQ Schema</h3>
                  <p>Add FAQ schema to increase featured snippets</p>
                  <div className="opportunity-impact">+15% visibility</div>
                  <button onClick={() => deployOpportunity('FAQ Schema')}>
                    Deploy Now
                  </button>
                </div>
                <div className="opportunity-card">
                  <h3>Local Business Schema</h3>
                  <p>Enhance local search presence</p>
                  <div className="opportunity-impact">+8% local traffic</div>
                  <button onClick={() => deployOpportunity('Local Schema')}>
                    Deploy Now
                  </button>
                </div>
                <div className="opportunity-card">
                  <h3>Review Response</h3>
                  <p>Respond to 3 pending reviews</p>
                  <div className="opportunity-impact">+5% reputation</div>
                  <button onClick={() => deployOpportunity('Review Response')}>
                    Deploy Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="tab-content">
              <h2>Competitor Analysis</h2>
              <div className="competitor-grid">
                <div className="competitor-card">
                  <h3>AutoMax Dealership</h3>
                  <div className="competitor-score">92.1</div>
                  <div className="competitor-trend up">+2.3%</div>
                </div>
                <div className="competitor-card">
                  <h3>Premier Motors</h3>
                  <div className="competitor-score">88.7</div>
                  <div className="competitor-trend down">-1.1%</div>
                </div>
                <div className="competitor-card">
                  <h3>Elite Auto Group</h3>
                  <div className="competitor-score">85.4</div>
                  <div className="competitor-trend up">+0.8%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-content">
              <h2>Review Management</h2>
              <div className="reviews-summary">
                <div className="review-metric">
                  <h3>Average Rating</h3>
                  <div className="rating">4.7 ⭐</div>
                </div>
                <div className="review-metric">
                  <h3>Total Reviews</h3>
                  <div className="count">1,247</div>
                </div>
                <div className="review-metric">
                  <h3>Response Rate</h3>
                  <div className="rate">89%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'filtering' && (
            <div className="tab-content">
              <AdvancedFiltering />
            </div>
          )}

          {activeTab === 'gamification' && (
            <div className="tab-content">
              <GamificationSystem />
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="tab-content">
              <TeamCollaboration />
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="tab-content">
              <WorkflowBuilder />
            </div>
          )}

          {activeTab === 'voice-commands' && (
            <div className="tab-content">
              <VoiceCommands />
            </div>
          )}

          {activeTab === 'personalization' && (
            <div className="tab-content">
              <AdvancedPersonalization />
            </div>
          )}

        {activeTab === 'micro-frontend' && (
          <div className="tab-content">
            <MicroFrontendArchitecture />
          </div>
        )}
        {activeTab === 'competitive-advantage' && (
          <div className="tab-content">
            <CompetitiveAdvantageDashboard />
          </div>
        )}

        {activeTab === 'smart-analytics' && (
          <div className="tab-content">
            <SmartAnalytics />
          </div>
        )}

        {activeTab === 'customer-journey' && (
          <div className="tab-content">
            <CustomerJourneyAnalytics />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-content">
            <SecurityCompliance />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="tab-content">
            <PerformanceOptimizer />
          </div>
        )}

        {activeTab === 'api-integrations' && (
          <div className="tab-content">
            <APIIntegrationHub />
          </div>
        )}

        {activeTab === 'data-import-export' && (
          <div className="tab-content">
            <DataImportExport />
          </div>
        )}

        {activeTab === 'marketing-platforms' && (
          <div className="tab-content">
            <MarketingPlatformIntegration />
          </div>
        )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2>Settings</h2>
              <div className="settings-grid">
                <div className="settings-section">
                  <h3>Preferences</h3>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                    Dark Mode
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Email Notifications
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Auto-refresh
                  </label>
                </div>
                <div className="settings-section">
                  <h3>Export Options</h3>
                  <button onClick={exportToPDF}>Export to PDF</button>
                  <button onClick={exportToCSV}>Export to CSV</button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Chat Assistant */}
        <ChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </ErrorBoundary>
  );
};

export default DealershipAIDashboardEnhanced;
