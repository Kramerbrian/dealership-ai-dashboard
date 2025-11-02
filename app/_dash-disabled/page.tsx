"use client";

import React, { useState, useEffect } from "react";

// Types for modal content
interface ModalContent {
  title: string;
  body: React.ReactNode;
}

// EEAT improvement data used by the openEEAT helper
const EEAT_DATA = {
  Experience: {
    desc: "First-hand expertise and real-world knowledge",
    gaps: [
      { name: "Customer story videos", impact: "+8 pts", effort: "4h" },
      { name: "Behind-the-scenes content", impact: "+6 pts", effort: "6h" },
      { name: "Staff certifications", impact: "+4 pts", effort: "2h" }
    ]
  },
  Expertise: {
    desc: "Technical knowledge and qualifications",
    gaps: [
      { name: "Advanced diagnostics", impact: "+5 pts", effort: "8h" },
      { name: "Industry trends", impact: "+4 pts", effort: "6h" },
      { name: "How‑to guides", impact: "+3 pts", effort: "4h" }
    ]
  },
  Authority: {
    desc: "Recognition in automotive industry",
    gaps: [
      { name: "Partnership content", impact: "+9 pts", effort: "3h" },
      { name: "Award showcase", impact: "+7 pts", effort: "2h" },
      { name: "Expert quotes", impact: "+5 pts", effort: "5h" }
    ]
  },
  Trust: {
    desc: "Reliability and customer confidence",
    gaps: [
      { name: "Price transparency", impact: "+3 pts", effort: "2h" },
      { name: "Process docs", impact: "+2 pts", effort: "3h" },
      { name: "Guarantees", impact: "+2 pts", effort: "1h" }
    ]
  }
} as const;

// Main DealershipAIDashboardLA component
const DealershipAIDashboardLA: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: "", body: null });
  const [profile, setProfile] = useState({ name: "Lou Grubbs Motors", location: "Chicago, IL" });

  // Keep setProfile for future profile editing functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateProfile = (name: string, location: string) => {
    setProfile({ name, location });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Handler for opening EEAT modal with dynamic content
  const openEEAT = (factor: keyof typeof EEAT_DATA, score: number, color: string) => {
    const info = EEAT_DATA[factor];
    const body = (
      <div>
        <div
          style={{
            marginBottom: 20,
            padding: 20,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            borderRadius: 12,
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 48, fontWeight: "bold", color: color, marginBottom: 10 }}>{score}</div>
          <p style={{ color: "#666" }}>{info.desc}</p>
        </div>
        <h3 style={{ marginBottom: 15 }}>Improvement Opportunities</h3>
        {info.gaps.map((gap, idx) => (
          <div
            key={idx}
            style={{
              padding: 15,
              background: "#fff8e1",
              border: "1px solid #ffd54f",
              borderRadius: 8,
              marginBottom: 10
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>{gap.name}</strong>
              <div>
                <span
                  style={{
                    background: "#e8f5e9",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    marginRight: 5
                  }}
                >
                  {gap.impact}
                </span>
                <span
                  style={{
                    background: "#e3f2fd",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11
                  }}
                >
                  {gap.effort}
                </span>
              </div>
            </div>
            <button
              className="btn success"
              style={{ padding: "4px 12px", fontSize: 12 }}
              onClick={() => window.alert(`Deploying ${gap.name}...`)}
            >
              Deploy
            </button>
          </div>
        ))}
        <button
          className="btn primary"
          style={{ width: "100%", marginTop: 15 }}
          onClick={() => window.alert(`Auto‑implementing all ${factor} improvements...`)}
        >
          Auto‑Implement All
        </button>
      </div>
    );
    openModal({ title: `${factor} Score: ${score}`, body });
  };

  const deployOpportunity = (type: string) => {
    const messages: Record<string, string> = {
      faq: "Deploying FAQ Schema...\n\nGenerating markup\nValidating\nPublishing\n\n+23% voice traffic",
      content: "Creating Content...\n\nResearching comparison\nWriting guide\nOptimizing\n\n156 leads/month",
      video: "Video Testimonials...\n\nContacting customers\nScheduling sessions\n\n+18% conversion"
    };
    window.alert(messages[type] ?? "Deploying...");
  };

  return (
    <>
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .flex { display: flex; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
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
        .text-base { font-size: 14px; }
        .grid { display: grid; gap: 20px; }
        .grid-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-4 { grid-template-columns: repeat(4, 1fr); }
        .grid-5 { grid-template-columns: repeat(5, 1fr); }
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
        .badge.critical { background: #ffebee; color: #c62828; border: 1px solid #ef5350; }
        .badge.high { background: #fff3e0; color: #ef6c00; border: 1px solid #ff9800; }
        .badge.medium { background: #e3f2fd; color: #1565c0; border: 1px solid #2196f3; }
        .badge.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #4CAF50; }
        .btn { padding: 8px 16px; border: 2px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 14px; transition: all 0.3s; text-align: center; }
        .btn:hover { background: #f5f5f5; transform: translateY(-1px); }
        .btn.primary { background: #2196F3; color: white; border-color: #1976D2; }
        .btn.success { background: #4CAF50; color: white; border-color: #388E3C; }
        .btn.danger { background: #f44336; color: white; border-color: #d32f2f; }
        .btn.warning { background: #ff9800; color: white; border-color: #ef6c00; }
        .btn.primary:hover { background: #1976D2; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); }
        .modal.show { display: flex; align-items: center; justify-content: center; }
        .modal-content { background: white; border-radius: 12px; width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: slideIn 0.3s ease; }
        .modal-header { padding: 25px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center; }
        .modal-title { font-size: 24px; font-weight: 600; margin: 0; }
        .modal-body { padding: 30px; }
        .close-btn { background: none; border: none; color: white; font-size: 28px; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background-color 0.3s; }
        .close-btn:hover { background-color: rgba(255,255,255,0.2); }
        .opportunities { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; padding: 25px; margin: 20px 0; }
        .opportunity-item { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 15px; margin-bottom: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s; }
        .opportunity-item:hover { background: rgba(255,255,255,0.25); transform: translateX(5px); }
        .main-content { padding: 30px; min-height: 600px; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .section-header { font-size: 20px; font-weight: 600; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
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
          <div className="flex gap-20" style={{ alignItems: 'center', fontSize: 14, color: '#666' }}>
            <div className="pulse" style={{ width: 8, height: 8, background: '#4CAF50', borderRadius: '50%' }} />
            <span>Live</span>
            <span>
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
            { id: 'website', icon: '🌐', label: 'Website' },
            { id: 'schema', icon: '🔍', label: 'Schema' },
            { id: 'reviews', icon: '⭐', label: 'Reviews' },
            { id: 'war-room', icon: '⚔️', label: 'War Room' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map((tab, idx) => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              title={`Press ${idx + 1} to switch`}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Overview Tab */}
          <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`} id="overview">
            {/* Executive Dashboard (summary cards) */}
            <div className="grid grid-3 mb-20">
              {/* SEO Card */}
              <div
                className="card primary"
                onClick={() => openModal({ title: 'SEO Health Score', body: <p>SEO visibility metrics across search engines. This score represents your organic search performance.</p> })}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#2196F3', fontSize: 16, fontWeight: 600 }}>🔍 SEO Visibility</h3>
                  <span
                    style={{
                      background: '#e3f2fd',
                      color: '#2196F3',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600
                    }}
                  >
                    GOOD
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 42, fontWeight: 300, color: '#2196F3', lineHeight: 1 }}>87.3</div>
                  <span style={{ fontSize: 14, color: '#4CAF50', fontWeight: 600 }}>+12%</span>
                </div>
                <div className="metric-progress">
                  <div
                    className="metric-progress-bar"
                    style={{ width: '87.3%', background: 'linear-gradient(90deg, #2196F3, #1976D2)' }}
                  />
                </div>
                <div className="text-sm" style={{ color: '#666', marginTop: 10 }}>
                  Mentions(20%) + Citations(25%) + Sentiment(15%)
                </div>
              </div>
              {/* AEO Card */}
              <div
                className="card warning"
                onClick={() => openEEAT('Authority', 73.8, '#ff9800')}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#ff9800', fontSize: 16, fontWeight: 600 }}>🎯 AEO Visibility</h3>
                  <span
                    style={{
                      background: '#fff3e0',
                      color: '#ff9800',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600
                    }}
                  >
                    NEEDS WORK
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 42, fontWeight: 300, color: '#ff9800', lineHeight: 1 }}>73.8</div>
                  <span style={{ fontSize: 14, color: '#4CAF50', fontWeight: 600 }}>+8%</span>
                </div>
                <div className="metric-progress">
                  <div
                    className="metric-progress-bar"
                    style={{ width: '73.8%', background: 'linear-gradient(90deg, #ff9800, #ef6c00)' }}
                  />
                </div>
                <div className="text-sm" style={{ color: '#666', marginTop: 10 }}>
                  Mentions(30%) + Citations(35%) + Sentiment(10%)
                </div>
              </div>
              {/* GEO Card */}
              <div
                className="card danger"
                onClick={() => openEEAT('Experience', 65.2, '#f44336')}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#f44336', fontSize: 16, fontWeight: 600 }}>🤖 GEO Visibility</h3>
                  <span
                    style={{
                      background: '#ffebee',
                      color: '#f44336',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600
                    }}
                  >
                    CRITICAL
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 15 }}>
                  <div style={{ fontSize: 42, fontWeight: 300, color: '#f44336', lineHeight: 1 }}>65.2</div>
                  <span style={{ fontSize: 14, color: '#4CAF50', fontWeight: 600 }}>+3%</span>
                </div>
                <div className="metric-progress">
                  <div
                    className="metric-progress-bar"
                    style={{ width: '65.2%', background: 'linear-gradient(90deg, #f44336, #f44336)' }}
                  />
                </div>
                <div className="text-sm" style={{ color: '#666', marginTop: 10 }}>
                  Mentions(25%) + Citations(30%) + Sentiment(20%)
                </div>
              </div>
            </div>

            {/* Summary metrics (row 2) */}
            <div className="grid grid-4 mb-20">
              <div className="card primary">
                <div className="metric-label">Total Visibility Score</div>
                <div className="metric-value" style={{ color: '#1976D2' }}>87.3</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '87.3%', background: 'linear-gradient(90deg, #2196F3, #1976D2)' }} />
                </div>
                <div className="text-sm" style={{ color: '#666' }}>Across all platforms</div>
              </div>
              <div className="card success">
                <div className="metric-label">Revenue Impact</div>
                <div className="metric-value" style={{ color: '#388E3C' }}>$367K</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '75%' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>+$45K from last month</div>
              </div>
              <div className="card warning">
                <div className="metric-label">Opportunities Found</div>
                <div className="metric-value" style={{ color: '#ef6c00' }}>23</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '65%', background: 'linear-gradient(90deg, #ff9800, #ef6c00)' }} />
                </div>
                <div className="text-sm" style={{ color: '#666' }}>8 high priority</div>
              </div>
              <div className="card">
                <div className="metric-label">Trust Score</div>
                <div className="metric-value">92/100</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '92%' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>Excellent</div>
              </div>
            </div>

            {/* Opportunities Engine */}
            <div className="opportunities mb-30">
              <h2 className="mb-20">AI Opportunities Engine - Smart Detection Active</h2>
              <div className="grid grid-2" style={{ gap: 15 }}>
                <div className="opportunity-item">
                  <div className="flex-between mb-10">
                    <strong>Add FAQ Schema</strong>
                    <span style={{ background: 'rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>+23% Voice</span>
                  </div>
                  <div style={{ opacity: 0.9, marginBottom: 10 }}>1,340 additional voice search impressions/month</div>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 12, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                    onClick={() => deployOpportunity('faq')}
                  >
                    Deploy
                  </button>
                </div>
                <div className="opportunity-item">
                  <div className="flex-between mb-10">
                    <strong>Target "Honda CR-V vs RAV4"</strong>
                    <span style={{ background: 'rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>156 Leads</span>
                  </div>
                  <div style={{ opacity: 0.9, marginBottom: 10 }}>High-intent keyword gap, 12.4K monthly searches</div>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 12, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
                    onClick={() => deployOpportunity('content')}
                  >
                    Create Content
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Health Tab */}
          <div className={`tab-content ${activeTab === 'ai-health' ? 'active' : ''}`} id="ai-health">
            <h2 className="section-header">AI Health Monitor</h2>
            
            {/* AI Service Status */}
            <div className="grid grid-2 mb-20">
              <div className="card success">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#4CAF50', fontSize: 16, fontWeight: 600 }}>🤖 ChatGPT</h3>
                  <span className="badge success">ACTIVE</span>
                </div>
                <div className="metric-value" style={{ color: '#4CAF50' }}>98.2%</div>
                <div className="text-sm" style={{ color: '#666' }}>Uptime • 45ms avg response</div>
              </div>
              
              <div className="card success">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#4CAF50', fontSize: 16, fontWeight: 600 }}>🧠 Claude</h3>
                  <span className="badge success">ACTIVE</span>
                </div>
                <div className="metric-value" style={{ color: '#4CAF50' }}>99.1%</div>
                <div className="text-sm" style={{ color: '#666' }}>Uptime • 52ms avg response</div>
              </div>
              
              <div className="card warning">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#ff9800', fontSize: 16, fontWeight: 600 }}>🔍 Perplexity</h3>
                  <span className="badge high">RATE LIMITED</span>
                </div>
                <div className="metric-value" style={{ color: '#ff9800' }}>87.3%</div>
                <div className="text-sm" style={{ color: '#666' }}>Uptime • 1.2s avg response</div>
              </div>
              
              <div className="card success">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#4CAF50', fontSize: 16, fontWeight: 600 }}>💎 Gemini</h3>
                  <span className="badge success">ACTIVE</span>
                </div>
                <div className="metric-value" style={{ color: '#4CAF50' }}>96.8%</div>
                <div className="text-sm" style={{ color: '#666' }}>Uptime • 38ms avg response</div>
              </div>
            </div>

            {/* Usage Metrics */}
            <div className="grid grid-3 mb-20">
              <div className="card">
                <div className="metric-label">API Calls Today</div>
                <div className="metric-value">2,847</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '68%' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>+12% from yesterday</div>
              </div>
              
              <div className="card">
                <div className="metric-label">Cost Today</div>
                <div className="metric-value">$23.45</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '45%', background: 'linear-gradient(90deg, #ff9800, #ef6c00)' }} />
                </div>
                <div className="text-sm" style={{ color: '#ff9800' }}>+8% from yesterday</div>
              </div>
              
              <div className="card">
                <div className="metric-label">Error Rate</div>
                <div className="metric-value">0.3%</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '3%', background: 'linear-gradient(90deg, #4CAF50, #8BC34A)' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>Excellent</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="mb-15">Recent AI Activity</h3>
              <div className="space-y-10">
                <div className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <strong>SEO Analysis Request</strong>
                    <div className="text-sm" style={{ color: '#666' }}>ChatGPT • 2 minutes ago</div>
                  </div>
                  <span className="badge success">SUCCESS</span>
                </div>
                <div className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <strong>Content Optimization</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Claude • 5 minutes ago</div>
                  </div>
                  <span className="badge success">SUCCESS</span>
                </div>
                <div className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <strong>Competitor Analysis</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Perplexity • 8 minutes ago</div>
                  </div>
                  <span className="badge high">RATE LIMITED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Website Tab */}
          <div className={`tab-content ${activeTab === 'website' ? 'active' : ''}`} id="website">
            <h2 className="section-header">Website Performance Monitor</h2>
            
            {/* Core Web Vitals */}
            <div className="grid grid-3 mb-20">
              <div className="card primary">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#2196F3', fontSize: 16, fontWeight: 600 }}>⚡ LCP</h3>
                  <span className="badge success">GOOD</span>
                </div>
                <div className="metric-value" style={{ color: '#2196F3' }}>1.8s</div>
                <div className="text-sm" style={{ color: '#666' }}>Largest Contentful Paint</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '85%', background: 'linear-gradient(90deg, #4CAF50, #8BC34A)' }} />
                </div>
              </div>
              
              <div className="card success">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#4CAF50', fontSize: 16, fontWeight: 600 }}>👆 FID</h3>
                  <span className="badge success">EXCELLENT</span>
                </div>
                <div className="metric-value" style={{ color: '#4CAF50' }}>45ms</div>
                <div className="text-sm" style={{ color: '#666' }}>First Input Delay</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '95%' }} />
                </div>
              </div>
              
              <div className="card warning">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#ff9800', fontSize: 16, fontWeight: 600 }}>📐 CLS</h3>
                  <span className="badge high">NEEDS WORK</span>
                </div>
                <div className="metric-value" style={{ color: '#ff9800' }}>0.12</div>
                <div className="text-sm" style={{ color: '#666' }}>Cumulative Layout Shift</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '60%', background: 'linear-gradient(90deg, #ff9800, #ef6c00)' }} />
                </div>
              </div>
            </div>

            {/* Performance Scores */}
            <div className="grid grid-4 mb-20">
              <div className="card">
                <div className="metric-label">Page Speed (Mobile)</div>
                <div className="metric-value">87</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '87%' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>Good</div>
              </div>
              
              <div className="card">
                <div className="metric-label">Page Speed (Desktop)</div>
                <div className="metric-value">94</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '94%' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>Excellent</div>
              </div>
              
              <div className="card">
                <div className="metric-label">Accessibility</div>
                <div className="metric-value">92</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '92%' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>Excellent</div>
              </div>
              
              <div className="card">
                <div className="metric-label">SEO Score</div>
                <div className="metric-value">89</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '89%' }} />
                </div>
                <div className="text-sm" style={{ color: '#4CAF50' }}>Good</div>
              </div>
            </div>

            {/* SEO Issues */}
            <div className="card mb-20">
              <h3 className="mb-15">SEO Issues & Recommendations</h3>
              <div className="space-y-10">
                <div className="flex-between" style={{ padding: '15px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#ef6c00' }}>High Priority</strong>
                    <div className="text-sm" style={{ color: '#666' }}>12 images missing alt text</div>
                  </div>
                  <button 
                    className="btn warning"
                    onClick={() => window.alert('Auto-fixing missing alt text...\n\nScanning images\nGenerating descriptions\nUpdating markup\n\n+8 SEO points')}
                  >
                    Auto-Fix
                  </button>
                </div>
                
                <div className="flex-between" style={{ padding: '15px', background: '#e3f2fd', border: '1px solid #2196F3', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#1976D2' }}>Medium Priority</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Missing meta descriptions on 3 pages</div>
                  </div>
                  <button 
                    className="btn primary"
                    onClick={() => window.alert('Generating meta descriptions...\n\nAnalyzing content\nCreating descriptions\nUpdating pages\n\n+5 SEO points')}
                  >
                    Generate
                  </button>
                </div>
                
                <div className="flex-between" style={{ padding: '15px', background: '#e8f5e9', border: '1px solid #4CAF50', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#388E3C' }}>Low Priority</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Inconsistent heading hierarchy</div>
                  </div>
                  <button 
                    className="btn success"
                    onClick={() => window.alert('Optimizing heading structure...\n\nAnalyzing hierarchy\nReorganizing headings\nValidating structure\n\n+3 SEO points')}
                  >
                    Optimize
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Issues */}
            <div className="card">
              <h3 className="mb-15">Technical Performance</h3>
              <div className="grid grid-2" style={{ gap: '15px' }}>
                <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <strong>Mobile Responsiveness</strong>
                    <span className="badge success">PASS</span>
                  </div>
                  <div className="text-sm" style={{ color: '#666' }}>All pages are mobile-friendly</div>
                </div>
                
                <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <strong>HTTPS Security</strong>
                    <span className="badge success">SECURE</span>
                  </div>
                  <div className="text-sm" style={{ color: '#666' }}>SSL certificate valid</div>
                </div>
                
                <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <strong>Page Load Speed</strong>
                    <span className="badge medium">OPTIMIZING</span>
                  </div>
                  <div className="text-sm" style={{ color: '#666' }}>2.3s average load time</div>
                </div>
                
                <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <strong>Image Optimization</strong>
                    <span className="badge high">NEEDS WORK</span>
                  </div>
                  <div className="text-sm" style={{ color: '#666' }}>8 images need compression</div>
                </div>
              </div>
            </div>
          </div>

          {/* Schema Tab */}
          <div className={`tab-content ${activeTab === 'schema' ? 'active' : ''}`} id="schema">
            <h2 className="section-header">Schema Markup Manager</h2>
            
            {/* Schema Validation Status */}
            <div className="grid grid-2 mb-20">
              <div className="card success">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#4CAF50', fontSize: 16, fontWeight: 600 }}>✅ Schema Status</h3>
                  <span className="badge success">VALID</span>
                </div>
                <div className="metric-value" style={{ color: '#4CAF50' }}>87%</div>
                <div className="text-sm" style={{ color: '#666' }}>Valid schema markup detected</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '87%' }} />
                </div>
              </div>
              
              <div className="card warning">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#ff9800', fontSize: 16, fontWeight: 600 }}>⚠️ Issues Found</h3>
                  <span className="badge high">3 ERRORS</span>
                </div>
                <div className="metric-value" style={{ color: '#ff9800' }}>3</div>
                <div className="text-sm" style={{ color: '#666' }}>Schema validation errors</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '15%', background: 'linear-gradient(90deg, #ff9800, #ef6c00)' }} />
                </div>
              </div>
            </div>

            {/* Schema Opportunities */}
            <div className="card mb-20">
              <h3 className="mb-15">Schema Opportunities</h3>
              <div className="space-y-10">
                <div className="flex-between" style={{ padding: '15px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#ef6c00' }}>High Priority: FAQ Schema</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Add FAQ structured data to service pages</div>
                    <div className="text-sm" style={{ color: '#4CAF50', fontWeight: 600 }}>+23% voice search visibility</div>
                  </div>
                  <button 
                    className="btn warning"
                    onClick={() => window.alert('Implementing FAQ Schema...\n\nScanning service pages\nGenerating FAQ markup\nValidating schema\nPublishing changes\n\n+23% voice search visibility')}
                  >
                    Deploy
                  </button>
                </div>
                
                <div className="flex-between" style={{ padding: '15px', background: '#e3f2fd', border: '1px solid #2196F3', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#1976D2' }}>Medium Priority: Product Schema</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Implement Product schema for inventory</div>
                    <div className="text-sm" style={{ color: '#4CAF50', fontWeight: 600 }}>+15% rich snippet appearance</div>
                  </div>
                  <button 
                    className="btn primary"
                    onClick={() => window.alert('Adding Product Schema...\n\nAnalyzing inventory\nCreating product markup\nValidating schema\nUpdating listings\n\n+15% rich snippet appearance')}
                  >
                    Implement
                  </button>
                </div>
                
                <div className="flex-between" style={{ padding: '15px', background: '#e8f5e9', border: '1px solid #4CAF50', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#388E3C' }}>High Priority: LocalBusiness Schema</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Enhance LocalBusiness schema with hours & reviews</div>
                    <div className="text-sm" style={{ color: '#4CAF50', fontWeight: 600 }}>+30% local search visibility</div>
                  </div>
                  <button 
                    className="btn success"
                    onClick={() => window.alert('Enhancing LocalBusiness Schema...\n\nAdding business hours\nIncluding review data\nUpdating location info\nValidating markup\n\n+30% local search visibility')}
                  >
                    Enhance
                  </button>
                </div>
              </div>
            </div>

            {/* Rich Snippet Previews */}
            <div className="card mb-20">
              <h3 className="mb-15">Rich Snippet Previews</h3>
              <div className="space-y-15">
                <div style={{ padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <strong>Organization Schema</strong>
                    <span className="badge success">ACTIVE</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#333' }}>
                    <strong>Premium Auto Dealership</strong><br/>
                    ⭐ 4.8 (342 reviews) • Your trusted automotive partner in Cape Coral, FL
                  </div>
                </div>
                
                <div style={{ padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <strong>Service Schema</strong>
                    <span className="badge success">ACTIVE</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#333' }}>
                    <strong>Auto Repair Services</strong><br/>
                    Professional automotive repair and maintenance services • $89.99 • In Stock
                  </div>
                </div>
                
                <div style={{ padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <strong>Event Schema</strong>
                    <span className="badge medium">PENDING</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#333' }}>
                    <strong>Summer Sale Event</strong><br/>
                    Save up to $5,000 on select vehicles • Limited time offer
                  </div>
                </div>
              </div>
            </div>

            {/* Schema Validation Errors */}
            <div className="card">
              <h3 className="mb-15">Schema Validation Issues</h3>
              <div className="space-y-10">
                <div className="flex-between" style={{ padding: '15px', background: '#ffebee', border: '1px solid #f44336', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#c62828' }}>Error: Missing Required Property</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Organization schema missing "name" property</div>
                    <div className="text-sm" style={{ color: '#666' }}>Path: /html/head/script[1]</div>
                  </div>
                  <button 
                    className="btn danger"
                    onClick={() => window.alert('Fixing Organization Schema...\n\nAdding required "name" property\nValidating schema\nUpdating markup\n\nSchema validation passed')}
                  >
                    Fix
                  </button>
                </div>
                
                <div className="flex-between" style={{ padding: '15px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#ef6c00' }}>Warning: Invalid Date Format</strong>
                    <div className="text-sm" style={{ color: '#666' }}>Event schema has invalid date format</div>
                    <div className="text-sm" style={{ color: '#666' }}>Path: /html/body/div[2]/script[1]</div>
                  </div>
                  <button 
                    className="btn warning"
                    onClick={() => window.alert('Fixing Date Format...\n\nConverting to ISO 8601 format\nValidating schema\nUpdating event markup\n\nDate format corrected')}
                  >
                    Fix
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Tab */}
          <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`} id="reviews">
            <h2 className="section-header">Review Management Center</h2>
            
            {/* Review Platform Summary */}
            <div className="grid grid-3 mb-20">
              <div className="card success">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#4CAF50', fontSize: 16, fontWeight: 600 }}>⭐ Google Reviews</h3>
                  <span className="badge success">ACTIVE</span>
                </div>
                <div className="metric-value" style={{ color: '#4CAF50' }}>4.7</div>
                <div className="text-sm" style={{ color: '#666' }}>342 reviews • +12 this week</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '94%' }} />
                </div>
              </div>
              
              <div className="card primary">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#2196F3', fontSize: 16, fontWeight: 600 }}>📝 Yelp Reviews</h3>
                  <span className="badge success">ACTIVE</span>
                </div>
                <div className="metric-value" style={{ color: '#2196F3' }}>4.5</div>
                <div className="text-sm" style={{ color: '#666' }}>128 reviews • +3 this week</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '90%', background: 'linear-gradient(90deg, #2196F3, #1976D2)' }} />
                </div>
              </div>
              
              <div className="card warning">
                <div className="flex-between mb-10">
                  <h3 style={{ color: '#ff9800', fontSize: 16, fontWeight: 600 }}>📘 Facebook Reviews</h3>
                  <span className="badge success">ACTIVE</span>
                </div>
                <div className="metric-value" style={{ color: '#ff9800' }}>4.8</div>
                <div className="text-sm" style={{ color: '#666' }}>89 reviews • +5 this week</div>
                <div className="metric-progress">
                  <div className="metric-progress-bar" style={{ width: '96%', background: 'linear-gradient(90deg, #ff9800, #ef6c00)' }} />
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="card mb-20">
              <h3 className="mb-15">Sentiment Analysis</h3>
              <div className="grid grid-4 mb-15">
                <div className="text-center">
                  <div className="metric-value" style={{ color: '#4CAF50', fontSize: 32 }}>82%</div>
                  <div className="text-sm" style={{ color: '#666' }}>Positive</div>
                </div>
                <div className="text-center">
                  <div className="metric-value" style={{ color: '#ff9800', fontSize: 32 }}>15%</div>
                  <div className="text-sm" style={{ color: '#666' }}>Neutral</div>
                </div>
                <div className="text-center">
                  <div className="metric-value" style={{ color: '#f44336', fontSize: 32 }}>3%</div>
                  <div className="text-sm" style={{ color: '#666' }}>Negative</div>
                </div>
                <div className="text-center">
                  <div className="metric-value" style={{ color: '#2196F3', fontSize: 32 }}>4.7</div>
                  <div className="text-sm" style={{ color: '#666' }}>Overall Rating</div>
                </div>
              </div>
              <div className="text-sm" style={{ color: '#4CAF50', textAlign: 'center' }}>
                📈 Sentiment trending positive (+5% this month)
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="card mb-20">
              <h3 className="mb-15">Recent Reviews</h3>
              <div className="space-y-15">
                <div style={{ padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <div>
                      <strong>Sarah Johnson</strong>
                      <div className="text-sm" style={{ color: '#666' }}>Google • 2 hours ago</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#ffc107' }}>⭐⭐⭐⭐⭐</span>
                      <span className="badge success">5.0</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#333', lineHeight: 1.4 }}>
                    "Excellent service! The team was professional and got my car fixed quickly. Highly recommend this dealership for all your automotive needs."
                  </div>
                  <div className="flex gap-10 mt-10">
                    <button 
                      className="btn success"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => window.alert('Thanking customer...\n\nSending personalized response\nNotifying team\nUpdating CRM\n\nResponse sent successfully')}
                    >
                      Thank Customer
                    </button>
                    <button 
                      className="btn primary"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => window.alert('Sharing review...\n\nPosting to social media\nAdding to website\nNotifying team\n\nReview shared successfully')}
                    >
                      Share
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <div>
                      <strong>Mike Chen</strong>
                      <div className="text-sm" style={{ color: '#666' }}>Google • 5 hours ago</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#ffc107' }}>⭐⭐⭐⭐</span>
                      <span className="badge medium">4.0</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#333', lineHeight: 1.4 }}>
                    "Good experience overall. Staff was friendly and knowledgeable. The only issue was the wait time, but the quality of service made up for it."
                  </div>
                  <div className="flex gap-10 mt-10">
                    <button 
                      className="btn primary"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => window.alert('Responding to feedback...\n\nAddressing wait time concern\nThanking for feedback\nInviting back\n\nResponse sent')}
                    >
                      Respond
                    </button>
                    <button 
                      className="btn warning"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => window.alert('Flagging for follow-up...\n\nNotifying management\nScheduling process review\nPlanning improvements\n\nFollow-up scheduled')}
                    >
                      Follow Up
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div className="flex-between mb-10">
                    <div>
                      <strong>Jennifer Davis</strong>
                      <div className="text-sm" style={{ color: '#666' }}>Yelp • 1 day ago</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#ffc107' }}>⭐⭐⭐⭐⭐</span>
                      <span className="badge success">5.0</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#333', lineHeight: 1.4 }}>
                    "Amazing customer service! The team went above and beyond to help me find the perfect car. The financing process was smooth and transparent."
                  </div>
                  <div className="flex gap-10 mt-10">
                    <button 
                      className="btn success"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => window.alert('Thanking customer...\n\nSending appreciation message\nSharing with team\nUpdating CRM\n\nThank you sent')}
                    >
                      Thank Customer
                    </button>
                    <button 
                      className="btn primary"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => window.alert('Sharing testimonial...\n\nAdding to website\nPosting to social media\nNotifying sales team\n\nTestimonial shared')}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitor Comparison */}
            <div className="card">
              <h3 className="mb-15">Competitor Review Analysis</h3>
              <div className="space-y-10">
                <div className="flex-between" style={{ padding: '15px', background: '#e8f5e9', border: '1px solid #4CAF50', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#388E3C' }}>You're Winning!</strong>
                    <div className="text-sm" style={{ color: '#666' }}>4.7 rating vs AutoMax's 4.3</div>
                    <div className="text-sm" style={{ color: '#4CAF50', fontWeight: 600 }}>+0.4 advantage</div>
                  </div>
                  <span className="badge success">LEADING</span>
                </div>
                
                <div className="flex-between" style={{ padding: '15px', background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#ef6c00' }}>Close Competition</strong>
                    <div className="text-sm" style={{ color: '#666' }}>4.7 rating vs Premier Motors' 4.6</div>
                    <div className="text-sm" style={{ color: '#ff9800', fontWeight: 600 }}>+0.1 advantage</div>
                  </div>
                  <span className="badge high">COMPETITIVE</span>
                </div>
                
                <div className="flex-between" style={{ padding: '15px', background: '#e3f2fd', border: '1px solid #2196F3', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#1976D2' }}>Market Leader</strong>
                    <div className="text-sm" style={{ color: '#666' }}>4.7 rating vs City Auto's 4.1</div>
                    <div className="text-sm" style={{ color: '#2196F3', fontWeight: 600 }}>+0.6 advantage</div>
                  </div>
                  <span className="badge success">DOMINANT</span>
                </div>
              </div>
            </div>
          </div>

          {/* War Room Tab - Competitive Intelligence */}
          <div className={`tab-content ${activeTab === 'war-room' ? 'active' : ''}`} id="war-room">
            <h2 className="section-header">⚔️ War Room - Competitive Intelligence</h2>
            
            {/* Threat Level Alert */}
            <div className="card danger mb-20" style={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' }}>
              <div className="flex-between mb-10">
                <h3 style={{ color: '#d32f2f', fontSize: 18, fontWeight: 600 }}>🚨 HIGH THREAT ALERT</h3>
                <span className="badge critical">ACTIVE</span>
              </div>
              <p style={{ color: '#c62828', marginBottom: 15 }}>
                Competitor "AutoMax Premium" has increased AI visibility by 23% this week, threatening your market position.
              </p>
              <div className="flex gap-10">
                <button className="btn danger" onClick={() => window.alert('Launching counter-campaign...\n\n• Deploying enhanced schema\n• Activating review response system\n• Targeting competitor keywords\n\nEstimated recovery: 48-72 hours')}>
                  Launch Counter-Campaign
                </button>
                <button className="btn" onClick={() => openModal({ 
                  title: 'Threat Analysis Details', 
                  body: (
                    <div>
                      <h4>Competitor Analysis: AutoMax Premium</h4>
                      <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                        <li>AI mentions increased from 45 to 68 (+23%)</li>
                        <li>New schema deployment detected</li>
                        <li>Review response rate: 89% (vs your 67%)</li>
                        <li>Voice search optimization active</li>
                      </ul>
                      <h4>Recommended Actions:</h4>
                      <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                        <li>Deploy FAQ schema immediately</li>
                        <li>Increase review response frequency</li>
                        <li>Target "Honda CR-V vs RAV4" keywords</li>
                        <li>Activate local SEO optimization</li>
                      </ol>
                    </div>
                  )
                })}>
                  View Analysis
                </button>
              </div>
            </div>

            {/* Competitive Landscape */}
            <div className="grid grid-2 mb-20">
              {/* Competitor Scoreboard */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 15, color: '#333' }}>🏆 Competitor Scoreboard</h3>
                <div className="space-y-3">
                  {[
                    { name: 'AutoMax Premium', score: 87.3, change: '+23%', status: 'threat', color: '#f44336' },
                    { name: 'Premium Auto Dealership (You)', score: 84.1, change: '+8%', status: 'stable', color: '#2196F3' },
                    { name: 'Elite Motors', score: 79.2, change: '+5%', status: 'stable', color: '#ff9800' },
                    { name: 'Luxury Auto Group', score: 72.8, change: '-2%', status: 'declining', color: '#4CAF50' },
                    { name: 'Metro Car Center', score: 68.4, change: '+12%', status: 'rising', color: '#9C27B0' }
                  ].map((competitor, idx) => (
                    <div key={competitor.name} className="flex-between p-15" style={{ 
                      background: idx === 1 ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : '#f9f9f9',
                      border: idx === 1 ? '2px solid #2196F3' : '1px solid #ddd',
                      borderRadius: '8px'
                    }}>
                      <div className="flex gap-10" style={{ alignItems: 'center' }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: competitor.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{competitor.name}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>AI Visibility Score</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 600, color: competitor.color }}>{competitor.score}</div>
                        <div style={{ 
                          fontSize: 12, 
                          color: competitor.change.startsWith('+') ? '#4CAF50' : '#f44336',
                          fontWeight: 600
                        }}>
                          {competitor.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Intelligence */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 15, color: '#333' }}>📊 Market Intelligence</h3>
                <div className="space-y-3">
                  <div className="p-15" style={{ background: '#f0f8ff', border: '1px solid #2196F3', borderRadius: '8px' }}>
                    <div className="flex-between mb-5">
                      <strong style={{ color: '#1976D2' }}>Market Share Analysis</strong>
                      <span style={{ fontSize: 12, color: '#666' }}>Last 30 days</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#1976D2', marginBottom: 5 }}>23.4%</div>
                    <div style={{ fontSize: 12, color: '#4CAF50' }}>+2.1% vs last month</div>
                  </div>
                  
                  <div className="p-15" style={{ background: '#fff3e0', border: '1px solid #ff9800', borderRadius: '8px' }}>
                    <div className="flex-between mb-5">
                      <strong style={{ color: '#ef6c00' }}>Keyword Gap Analysis</strong>
                      <span style={{ fontSize: 12, color: '#666' }}>Opportunities</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#ef6c00', marginBottom: 5 }}>47</div>
                    <div style={{ fontSize: 12, color: '#666' }}>High-value keywords competitors rank for</div>
                  </div>

                  <div className="p-15" style={{ background: '#e8f5e9', border: '1px solid #4CAF50', borderRadius: '8px' }}>
                    <div className="flex-between mb-5">
                      <strong style={{ color: '#2e7d32' }}>Content Gap Score</strong>
                      <span style={{ fontSize: 12, color: '#666' }}>Coverage</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#2e7d32', marginBottom: 5 }}>78%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Content coverage vs top competitors</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Actions */}
            <div className="card mb-20">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 15, color: '#333' }}>⚡ Tactical Actions</h3>
              <div className="grid grid-3 gap-15">
                {[
                  {
                    title: 'Deploy FAQ Schema',
                    description: 'Target 15 high-value questions competitors rank for',
                    impact: '+18% voice search',
                    time: '2 hours',
                    priority: 'high',
                    action: () => window.alert('Deploying FAQ Schema...\n\n• Analyzing competitor questions\n• Generating optimized answers\n• Deploying schema markup\n\nExpected impact: +18% voice search traffic')
                  },
                  {
                    title: 'Review Response Campaign',
                    description: 'Respond to 50+ recent reviews within 24 hours',
                    impact: '+12% trust signals',
                    time: '4 hours',
                    priority: 'high',
                    action: () => window.alert('Launching Review Response Campaign...\n\n• Identifying recent reviews\n• Generating personalized responses\n• Scheduling responses\n\nExpected impact: +12% trust signals')
                  },
                  {
                    title: 'Competitor Keyword Targeting',
                    description: 'Create content for 20 competitor keywords',
                    impact: '+25% organic traffic',
                    time: '1 day',
                    priority: 'medium',
                    action: () => window.alert('Creating Competitor Keyword Content...\n\n• Analyzing competitor rankings\n• Creating optimized content\n• Building internal links\n\nExpected impact: +25% organic traffic')
                  },
                  {
                    title: 'Local SEO Optimization',
                    description: 'Optimize Google Business Profile and local citations',
                    impact: '+15% local visibility',
                    time: '3 hours',
                    priority: 'medium',
                    action: () => window.alert('Optimizing Local SEO...\n\n• Updating Google Business Profile\n• Optimizing local citations\n• Building local backlinks\n\nExpected impact: +15% local visibility')
                  },
                  {
                    title: 'Schema Enhancement',
                    description: 'Deploy advanced schema for vehicles and services',
                    impact: '+22% rich snippets',
                    time: '2 hours',
                    priority: 'high',
                    action: () => window.alert('Deploying Advanced Schema...\n\n• Vehicle schema markup\n• Service schema markup\n• Organization schema\n\nExpected impact: +22% rich snippets')
                  },
                  {
                    title: 'Competitor Backlink Analysis',
                    description: 'Identify and replicate competitor backlink strategies',
                    impact: '+8% domain authority',
                    time: '6 hours',
                    priority: 'low',
                    action: () => window.alert('Analyzing Competitor Backlinks...\n\n• Identifying high-value backlinks\n• Creating outreach campaigns\n• Building relationships\n\nExpected impact: +8% domain authority')
                  }
                ].map((tactic, idx) => (
                  <div key={idx} className="p-15" style={{ 
                    background: tactic.priority === 'high' ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' : 
                               tactic.priority === 'medium' ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' : 
                               'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                    border: tactic.priority === 'high' ? '2px solid #f44336' : 
                           tactic.priority === 'medium' ? '2px solid #ff9800' : '2px solid #4CAF50',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s'
                  }}
                  onClick={tactic.action}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="flex-between mb-10">
                      <h4 style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: tactic.priority === 'high' ? '#d32f2f' : 
                               tactic.priority === 'medium' ? '#ef6c00' : '#2e7d32'
                      }}>
                        {tactic.title}
                      </h4>
                      <span style={{ 
                        fontSize: 10, 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: tactic.priority === 'high' ? '#f44336' : 
                                   tactic.priority === 'medium' ? '#ff9800' : '#4CAF50',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        {tactic.priority.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>{tactic.description}</p>
                    <div className="flex-between" style={{ fontSize: 11 }}>
                      <span style={{ color: '#4CAF50', fontWeight: 600 }}>{tactic.impact}</span>
                      <span style={{ color: '#666' }}>{tactic.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Monitoring */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 15, color: '#333' }}>📡 Real-time Monitoring</h3>
              <div className="grid grid-2 gap-15">
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#333' }}>Competitor Alerts</h4>
                  <div className="space-y-2">
                    {[
                      { time: '2 min ago', alert: 'AutoMax Premium published new FAQ page', severity: 'high' },
                      { time: '15 min ago', alert: 'Elite Motors updated schema markup', severity: 'medium' },
                      { time: '1 hour ago', alert: 'Luxury Auto Group launched review campaign', severity: 'high' },
                      { time: '2 hours ago', alert: 'Metro Car Center optimized for voice search', severity: 'medium' }
                    ].map((alert, idx) => (
                      <div key={idx} className="p-10" style={{ 
                        background: alert.severity === 'high' ? '#ffebee' : '#fff3e0',
                        border: `1px solid ${alert.severity === 'high' ? '#f44336' : '#ff9800'}`,
                        borderRadius: '6px',
                        fontSize: 12
                      }}>
                        <div className="flex-between">
                          <span style={{ color: '#666' }}>{alert.time}</span>
                          <span style={{ 
                            color: alert.severity === 'high' ? '#d32f2f' : '#ef6c00',
                            fontWeight: 600
                          }}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ marginTop: 5, color: '#333' }}>{alert.alert}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#333' }}>Market Trends</h4>
                  <div className="space-y-2">
                    {[
                      { trend: 'Voice search queries up 34%', change: '+34%', color: '#4CAF50' },
                      { trend: 'FAQ schema adoption +67%', change: '+67%', color: '#2196F3' },
                      { trend: 'Review response rate declining', change: '-12%', color: '#f44336' },
                      { trend: 'Local SEO competition up', change: '+23%', color: '#ff9800' }
                    ].map((trend, idx) => (
                      <div key={idx} className="flex-between p-10" style={{ 
                        background: '#f9f9f9',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: 12
                      }}>
                        <span style={{ color: '#333' }}>{trend.trend}</span>
                        <span style={{ 
                          color: trend.color,
                          fontWeight: 600
                        }}>
                          {trend.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Tab */}
          <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`} id="settings">
            <h2 className="section-header">Settings</h2>
            <div className="settings-nav mb-20">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'connections', label: 'Connections' }
              ].map(item => (
                <div key={item.id} className="settings-nav-item" onClick={() => openModal({ title: 'Coming Soon', body: <p>This feature is not yet implemented.</p> })}>
                  {item.label}
                </div>
              ))}
            </div>
            <p>Settings content placeholder.</p>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal show" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modalContent.title}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">{modalContent.body}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default function DashPage() {
  return <DealershipAIDashboardLA />;
}
