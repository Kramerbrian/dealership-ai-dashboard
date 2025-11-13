"use client";

import React, { useState } from "react";
import { useDashboardOverview, useAutoRefresh } from "@/lib/hooks/useDashboardData";

// Types for modal content
interface ModalContent {
  title: string;
  body: React.ReactNode;
}

// Main API-Connected Dashboard Component
const DashboardAPIConnected: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: "", body: null });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d');

  // Fetch dashboard data from API
  const { data, loading, error, refetch } = useDashboardOverview({
    dealerId: 'lou-grubbs-motors',
    timeRange,
  });

  // Auto-refresh every 60 seconds
  useAutoRefresh(() => {
    refetch();
  }, 60000);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const openModal = (content: ModalContent) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Show loading state
  if (loading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <h2 style={{ color: '#666', fontSize: 24, fontWeight: 600 }}>Loading Dashboard...</h2>
          <p style={{ color: '#999', marginTop: 10 }}>Fetching latest data from APIs</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', maxWidth: 500, padding: 30 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ color: '#f44336', fontSize: 24, fontWeight: 600, marginBottom: 10 }}>Error Loading Dashboard</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>{error.message}</p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '12px 24px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const profile = { name: "Lou Grubbs Motors", location: "Chicago, IL" };
  const currentTime = new Date();

  return (
    <>
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .flex { display: flex; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .gap-10 { gap: 10px; }
        .gap-15 { gap: 15px; }
        .gap-20 { gap: 20px; }
        .mb-10 { margin-bottom: 10px; }
        .mb-15 { margin-bottom: 15px; }
        .mb-20 { margin-bottom: 20px; }
        .mb-30 { margin-bottom: 30px; }
        .p-15 { padding: 15px; }
        .p-20 { padding: 20px; }
        .font-bold { font-weight: 600; }
        .text-sm { font-size: 12px; }
        .grid { display: grid; gap: 20px; }
        .grid-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-4 { grid-template-columns: repeat(4, 1fr); }
        .header, .nav-tabs, .card, .main-content { background: white; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .nav-tabs { padding: 15px; margin-bottom: 20px; display: flex; gap: 10px; overflow-x: auto; }
        .tab { padding: 10px 20px; background: #f5f5f5; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; cursor: pointer; white-space: nowrap; transition: all 0.3s; }
        .tab:hover { background: #e8e8e8; transform: translateY(-1px); }
        .tab.active { background: #2196F3; color: white; border-color: #1976D2; }
        .card { padding: 20px; transition: transform 0.3s, box-shadow 0.3s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .card.primary { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-color: #2196F3; }
        .card.warning { background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%); border-color: #ff9800; }
        .card.danger { background: linear-gradient(135deg, #ffebee 0%, #ef5350 100%); border-color: #f44336; }
        .card.success { background: linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%); border-color: #4CAF50; }
        .metric-value { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
        .metric-progress { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
        .metric-progress-bar { height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); border-radius: 4px; transition: width 0.5s ease; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .badge.medium { background: #e3f2fd; color: #1565c0; border: 1px solid #2196f3; }
        .badge.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #4CAF50; }
        .btn { padding: 8px 16px; border: 2px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 14px; transition: all 0.3s; }
        .btn:hover { background: #f5f5f5; transform: translateY(-1px); }
        .btn.primary { background: #2196F3; color: white; border-color: #1976D2; }
        .btn.primary:hover { background: #1976D2; }
        .main-content { padding: 30px; min-height: 600px; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .section-header { font-size: 20px; font-weight: 600; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
        .live-indicator { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #e8f5e9; border: 1px solid #4CAF50; border-radius: 8px; }
        .pulse { width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .refresh-btn { cursor: pointer; padding: 8px; border-radius: 4px; transition: background 0.3s; }
        .refresh-btn:hover { background: #f5f5f5; }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="flex gap-15">
            <div className="logo">dAI</div>
            <div>
              <h1 style={{ fontSize: 24 }}>DealershipAI</h1>
              <p className="text-sm" style={{ color: "#666" }}>Algorithmic Trust Dashboard</p>
            </div>
            <div
              style={{
                padding: '8px 16px',
                background: '#f9f9f9',
                border: '1px dashed #999',
                borderRadius: '4px',
                fontSize: 14
              }}
            >
              {profile.name} | {profile.location}
            </div>
            <span className="badge medium">PRO PLAN</span>
          </div>
          <div className="flex gap-20" style={{ alignItems: 'center' }}>
            <div className="live-indicator">
              <div className="pulse" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#2e7d32' }}>Live Data</span>
            </div>
            <button
              className="refresh-btn"
              onClick={() => refetch()}
              title="Refresh data"
            >
              🔄
            </button>
            <span style={{ fontSize: 14, color: '#666' }}>
              {currentTime.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'ai-health', icon: '🤖', label: 'AI Health' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map((tab) => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Overview Tab */}
          <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`} id="overview">
            <div className="grid grid-3 mb-20">
              {/* SEO Card */}
              <div className="card primary" style={{ cursor: 'pointer' }}>
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#2196F3', fontSize: 16, fontWeight: 600 }}>🔍 SEO Visibility</h3>
                  <span className="badge success">GOOD</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 42, fontWeight: 300, color: '#2196F3', lineHeight: 1 }}>
                    {data.aiVisibility.breakdown.seo.toFixed(1)}
                  </div>
                  <span style={{ fontSize: 14, color: data.aiVisibility.trend > 0 ? '#4CAF50' : '#f44336', fontWeight: 600 }}>
                    {data.aiVisibility.trend > 0 ? '+' : ''}{data.aiVisibility.trend.toFixed(1)}%
                  </span>
                </div>
                <div className="metric-progress">
                  <div
                    className="metric-progress-bar"
                    style={{ width: `${data.aiVisibility.breakdown.seo}%`, background: 'linear-gradient(90deg, #2196F3, #1976D2)' }}
                  />
                </div>
              </div>

              {/* AEO Card */}
              <div className="card warning" style={{ cursor: 'pointer' }}>
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#ff9800', fontSize: 16, fontWeight: 600 }}>🎯 AEO Visibility</h3>
                  <span className="badge" style={{ background: '#fff3e0', color: '#ff9800' }}>NEEDS WORK</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 42, fontWeight: 300, color: '#ff9800', lineHeight: 1 }}>
                    {data.aiVisibility.breakdown.aeo.toFixed(1)}
                  </div>
                  <span style={{ fontSize: 14, color: '#4CAF50', fontWeight: 600 }}>+8%</span>
                </div>
                <div className="metric-progress">
                  <div
                    className="metric-progress-bar"
                    style={{ width: `${data.aiVisibility.breakdown.aeo}%`, background: 'linear-gradient(90deg, #ff9800, #ef6c00)' }}
                  />
                </div>
              </div>

              {/* GEO Card */}
              <div className="card danger" style={{ cursor: 'pointer' }}>
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#f44336', fontSize: 16, fontWeight: 600 }}>🤖 GEO Visibility</h3>
                  <span className="badge" style={{ background: '#ffebee', color: '#f44336' }}>CRITICAL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 42, fontWeight: 300, color: '#f44336', lineHeight: 1 }}>
                    {data.aiVisibility.breakdown.geo.toFixed(1)}
                  </div>
                  <span style={{ fontSize: 14, color: '#4CAF50', fontWeight: 600 }}>+3%</span>
                </div>
                <div className="metric-progress">
                  <div
                    className="metric-progress-bar"
                    style={{ width: `${data.aiVisibility.breakdown.geo}%`, background: 'linear-gradient(90deg, #f44336, #f44336)' }}
                  />
                </div>
              </div>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-4 mb-20">
              <div className="card primary">
                <div className="metric-label">Total Visibility Score</div>
                <div className="metric-value" style={{ color: '#1976D2' }}>
                  {data.aiVisibility.score.toFixed(1)}
                </div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: `${data.aiVisibility.score}%`, background: 'linear-gradient(90deg, #2196F3, #1976D2)' }} />
                </div>
                <div className="text-sm" style={{ color: '#666' }}>Across all platforms</div>
              </div>

              <div className="card success">
                <div className="metric-label">Revenue Impact</div>
                <div className="metric-value" style={{ color: '#388E3C' }}>
                  ${(data.revenue.monthly / 1000).toFixed(0)}K
                </div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '75%' }} />
                </div>
                <div className="text-sm" style={{ color: data.revenue.trend > 0 ? '#4CAF50' : '#f44336' }}>
                  {data.revenue.trend > 0 ? '+' : ''}{data.revenue.trend.toFixed(1)}% from last month
                </div>
              </div>

              <div className="card">
                <div className="metric-label">Monthly Leads</div>
                <div className="metric-value">{data.leads.monthly}</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '70%' }} />
                </div>
                <div className="text-sm" style={{ color: data.leads.trend > 0 ? '#4CAF50' : '#f44336' }}>
                  {data.leads.trend > 0 ? '+' : ''}{data.leads.trend.toFixed(1)}% trend
                </div>
              </div>

              <div className="card">
                <div className="metric-label">Performance Score</div>
                <div className="metric-value">{data.performance.score.toFixed(0)}/100</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: `${data.performance.score}%` }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>
                  {data.performance.uptime.toFixed(1)}% uptime
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card">
              <h3 className="section-header">AI Recommendations</h3>
              <div className="grid grid-2" style={{ gap: 15 }}>
                {data.recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.id} style={{ padding: 15, background: '#f9f9f9', borderRadius: 8, border: '1px solid #ddd' }}>
                    <div className="flex-between mb-10">
                      <strong style={{ fontSize: 14 }}>{rec.title}</strong>
                      <span className={`badge ${rec.priority === 'high' ? 'badge-danger' : 'badge-medium'}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>{rec.description}</p>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                      <span style={{ color: '#4CAF50', fontWeight: 600 }}>Impact: {rec.impact}</span>
                      <span style={{ color: '#666' }}>Effort: {rec.effort}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Health Tab */}
          <div className={`tab-content ${activeTab === 'ai-health' ? 'active' : ''}`} id="ai-health">
            <h2 className="section-header">AI Platform Performance</h2>
            <div className="grid grid-2 mb-20">
              {Object.entries(data.aiVisibility.platforms).map(([platform, score]) => (
                <div key={platform} className="card success">
                  <div className="flex-between mb-10">
                    <h3 style={{ fontSize: 16, fontWeight: 600, textTransform: 'capitalize' }}>
                      {platform === 'chatgpt' ? '🤖 ChatGPT' :
                       platform === 'claude' ? '🧠 Claude' :
                       platform === 'perplexity' ? '🔍 Perplexity' : '💎 Gemini'}
                    </h3>
                    <span className="badge success">ACTIVE</span>
                  </div>
                  <div className="metric-value" style={{ color: '#4CAF50' }}>{score.toFixed(1)}%</div>
                  <div className="metric-progress">
                    <div className="metric-progress-bar" style={{ width: `${score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Tab */}
          <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`} id="settings">
            <h2 className="section-header">Dashboard Settings</h2>
            <div className="card">
              <h3 className="mb-15">Time Range</h3>
              <div className="flex gap-10">
                {(['7d', '30d', '90d', '365d'] as const).map((range) => (
                  <button
                    key={range}
                    className={`btn ${timeRange === range ? 'primary' : ''}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardAPIConnected;
