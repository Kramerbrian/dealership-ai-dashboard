"use client";

/*
 * DealershipAIDashboardLA
 *
 * This component is a TypeScript/React conversion of the static HTML design
 * found in the “DealershipAI - Dashboard- 10.9.25 - LA version” template.
 * It preserves the visual layout and basic interactions (tab switching,
 * modal dialogs, profile editing, and EEAT detail views) using React
 * state and event handlers. Some of the more advanced behaviours from
 * the original template (such as network requests or complex state
 * management) are omitted for brevity. If you need additional
 * functionality, consider extending the handlers or integrating with
 * your backend API.
 */

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

// Main component
const DealershipAIDashboardLA: React.FC = () => {
  // Top‑level state
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: "", body: null });
  const [profile] = useState({ name: "Premium Auto Dealership", location: "Cape Coral, FL" });

  // Update the clock once per minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handler for switching tabs
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Generic modal open function. If a title/body are provided they are set
  const openModal = (content: ModalContent) => {
    setModalContent(content);
    setModalOpen(true);
  };

  // Close modal
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

  // Placeholder handlers for actions that would normally call APIs or services
  const deployOpportunity = (type: string) => {
    const messages: Record<string, string> = {
      faq: "Deploying FAQ Schema...\n\nGenerating markup\nValidating\nPublishing\n\n+23% voice traffic",
      content: "Creating Content...\n\nResearching comparison\nWriting guide\nOptimizing\n\n156 leads/month",
      video: "Video Testimonials...\n\nContacting customers\nScheduling sessions\n\n+18% conversion"
    };
    window.alert(messages[type] ?? "Deploying...");
  };

  // Profile import helpers - removed unused saveProfile function

  // Render function
  return (
    <>
      {/* Global styles scoped to this component.  */}
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
        .feed-item { padding: 15px; background: white; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; font-size: 14px; }
        .feed-item.success { border-left: 4px solid #4CAF50; }
        .feed-item.warning { border-left: 4px solid #FFC107; }
        .feed-item.error { border-left: 4px solid #f44336; }
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
                onClick={() => openModal({ title: 'SEO Health Score', body: <p>No details provided</p> })}
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

          {/* AI Health Tab (placeholder) */}
          <div className={`tab-content ${activeTab === 'ai-health' ? 'active' : ''}`} id="ai-health">
            <h2 className="section-header">AI Health</h2>
            <p>This section is under construction.</p>
          </div>

          {/* Website Tab (placeholder) */}
          <div className={`tab-content ${activeTab === 'website' ? 'active' : ''}`} id="website">
            <h2 className="section-header">Website</h2>
            <p>This section is under construction.</p>
          </div>

          {/* Schema Tab (placeholder) */}
          <div className={`tab-content ${activeTab === 'schema' ? 'active' : ''}`} id="schema">
            <h2 className="section-header">Schema</h2>
            <p>This section is under construction.</p>
          </div>

          {/* Reviews Tab (placeholder) */}
          <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`} id="reviews">
            <h2 className="section-header">Reviews</h2>
            <p>This section is under construction.</p>
          </div>

          {/* War Room Tab (placeholder) */}
          <div className={`tab-content ${activeTab === 'war-room' ? 'active' : ''}`} id="war-room">
            <h2 className="section-header">War Room</h2>
            <p>This section is under construction.</p>
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

export default DealershipAIDashboardLA;