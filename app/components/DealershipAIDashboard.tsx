"use client";

import React, { useState, useEffect } from "react";
import "./dashboard.css";

type TabId = "overview" | "ai-health" | "website" | "schema" | "reviews" | "war-room" | "settings";
type SettingsTab = "profile" | "team" | "integrations" | "notifications" | "billing" | "automation" | "security";

// Enhanced API with more endpoints
const API = {
  // Existing endpoints
  getMetrics: async () => ({ seo: 87.3, aeo: 73.8, geo: 65.2 }),
  
  // Settings endpoints
  getProfile: async () => ({
    name: "Premium Auto Dealership",
    address: "123 Main St, Cape Coral, FL 33904",
    phone: "(239) 555-0123",
    email: "contact@premiumauto.com",
    website: "https://premiumauto.com",
    logo: null,
    timezone: "America/New_York",
    businessHours: { mon: "9AM-6PM", tue: "9AM-6PM", wed: "9AM-6PM", thu: "9AM-6PM", fri: "9AM-6PM", sat: "9AM-5PM", sun: "Closed" }
  }),
  
  getTeamMembers: async () => ([
    { id: 1, name: "John Smith", email: "john@premiumauto.com", role: "Admin", status: "active", lastActive: "2 hours ago" },
    { id: 2, name: "Sarah Johnson", email: "sarah@premiumauto.com", role: "Manager", status: "active", lastActive: "5 hours ago" },
    { id: 3, name: "Mike Davis", email: "mike@premiumauto.com", role: "Editor", status: "active", lastActive: "1 day ago" }
  ]),
  
  getIntegrations: async () => ({
    googleBusinessProfile: { connected: true, lastSync: "10 min ago", status: "healthy" },
    googleAnalytics: { connected: true, lastSync: "1 hour ago", status: "healthy" },
    googleSearchConsole: { connected: true, lastSync: "30 min ago", status: "healthy" },
    facebook: { connected: false, lastSync: null, status: "disconnected" },
    crm: { connected: false, lastSync: null, status: "disconnected" },
    zapier: { connected: true, lastSync: "5 min ago", status: "healthy" }
  }),
  
  getNotificationSettings: async () => ({
    email: { enabled: true, frequency: "daily", types: ["alerts", "reports", "opportunities"] },
    slack: { enabled: false, webhook: null },
    sms: { enabled: false, phone: null },
    alerts: {
      competitorChanges: true,
      rankingDrop: true,
      negativeReviews: true,
      schemaErrors: true,
      opportunityDetected: true
    }
  }),
  
  getBilling: async () => ({
    plan: "Pro",
    status: "active",
    nextBilling: "2025-11-15",
    amount: 299,
    paymentMethod: "•••• 4242",
    usage: { apiCalls: 14500, limit: 50000, reports: 23, limit2: 100 }
  }),
  
  getAutomationRules: async () => ([
    { id: 1, name: "Auto-respond to 5-star reviews", enabled: true, trigger: "new_review_5star", action: "send_template" },
    { id: 2, name: "Deploy FAQ schema on new content", enabled: true, trigger: "content_published", action: "generate_faq" },
    { id: 3, name: "Alert on competitor ranking change", enabled: false, trigger: "competitor_rank_change", action: "send_alert" }
  ]),
  
  getAPIKeys: async () => ([
    { id: 1, name: "Production API", key: "sk_live_••••••••4e2a", created: "2025-01-15", lastUsed: "2 hours ago", permissions: ["read", "write"] },
    { id: 2, name: "Development", key: "sk_test_••••••••9c1b", created: "2025-02-01", lastUsed: "5 days ago", permissions: ["read"] }
  ]),
  
  exportData: async (type: string) => ({ url: `/downloads/${type}_export.csv`, expires: "24h" })
};

export default function DealershipAIDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");
  const [time, setTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; title: string; body: React.ReactNode }>({ open: false, title: "", body: null });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k') {
          e.preventDefault();
          setShowCommandPalette(true);
        }
        if (e.key === 'd') {
          e.preventDefault();
          setDarkMode(!darkMode);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [darkMode]);

  const openModal = (title: string, body: React.ReactNode) => setModal({ open: true, title, body });
  const closeModal = () => setModal({ ...modal, open: false });

  const tabs = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "ai-health", icon: "🤖", label: "AI Health" },
    { id: "website", icon: "🌐", label: "Website" },
    { id: "schema", icon: "🔍", label: "Schema" },
    { id: "reviews", icon: "⭐", label: "Reviews" },
    { id: "war-room", icon: "⚔️", label: "War Room" },
    { id: "settings", icon: "⚙️", label: "Settings" }
  ];

  const settingsTabs = [
    { id: "profile", icon: "🏢", label: "Profile" },
    { id: "team", icon: "👥", label: "Team" },
    { id: "integrations", icon: "🔌", label: "Integrations" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "automation", icon: "⚡", label: "Automation" },
    { id: "security", icon: "🔒", label: "Security" },
    { id: "billing", icon: "💳", label: "Billing" }
  ];

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      {/* Header with Quick Actions */}
      <div className="header">
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <div className="logo">dAI</div>
          <div>
            <h1>DealershipAI</h1>
            <p className="text-sm">Algorithmic Trust Dashboard</p>
          </div>
          <span className="badge medium">PRO</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn" onClick={() => API.exportData('dashboard')} title="Export Report">
            📥 Export
          </button>
          <button className="btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn" onClick={() => setShowCommandPalette(true)} title="Command Palette (⌘K)">
            🔍
          </button>
          <div className="text-sm">{time.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="modal show" onClick={() => setShowCommandPalette(false)}>
          <div className="command-palette" onClick={e => e.stopPropagation()}>
            <input type="text" placeholder="Search commands... (⌘K)" autoFocus />
            <div className="command-list">
              <div className="command-item">📊 Go to Overview</div>
              <div className="command-item">⚙️ Open Settings</div>
              <div className="command-item">📥 Export Dashboard</div>
              <div className="command-item">🔒 Generate API Key</div>
              <div className="command-item">🌙 Toggle Dark Mode</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id as TabId)}>
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Settings Tab - Enhanced */}
        {activeTab === "settings" && (
          <div>
            <h2 className="section-header">Settings</h2>
            
            {/* Settings Navigation */}
            <div className="settings-nav">
              {settingsTabs.map((tab) => (
                <div key={tab.id} className={`settings-tab ${settingsTab === tab.id ? "active" : ""}`} onClick={() => setSettingsTab(tab.id as SettingsTab)}>
                  {tab.icon} {tab.label}
                </div>
              ))}
            </div>

            {/* Profile Settings */}
            {settingsTab === "profile" && (
              <div>
                <div className="card mb-20">
                  <h3>Business Information</h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Business Name</label>
                      <input type="text" defaultValue="Premium Auto Dealership" />
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      <input type="tel" defaultValue="(239) 555-0123" />
                    </div>
                    <div className="form-field full-width">
                      <label>Address</label>
                      <input type="text" defaultValue="123 Main St, Cape Coral, FL 33904" />
                    </div>
                    <div className="form-field">
                      <label>Email</label>
                      <input type="email" defaultValue="contact@premiumauto.com" />
                    </div>
                    <div className="form-field">
                      <label>Website</label>
                      <input type="url" defaultValue="https://premiumauto.com" />
                    </div>
                  </div>
                  <button className="btn primary">Save Changes</button>
                </div>

                <div className="card">
                  <h3>Business Hours</h3>
                  <div className="hours-grid">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <div key={day} className="hour-row">
                        <span>{day}</span>
                        <input type="text" defaultValue={day === 'Sunday' ? 'Closed' : '9:00 AM - 6:00 PM'} />
                      </div>
                    ))}
                  </div>
                  <button className="btn primary">Update Hours</button>
                </div>
              </div>
            )}

            {/* Team Management */}
            {settingsTab === "team" && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3>Team Members</h3>
                  <button className="btn primary">+ Invite Member</button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John Smith</td>
                      <td>john@premiumauto.com</td>
                      <td><span className="badge success">Admin</span></td>
                      <td><span style={{ color: "#4CAF50" }}>● Active</span></td>
                      <td>2 hours ago</td>
                      <td>
                        <button className="btn-small">Edit</button>
                        <button className="btn-small danger">Remove</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Sarah Johnson</td>
                      <td>sarah@premiumauto.com</td>
                      <td><span className="badge medium">Manager</span></td>
                      <td><span style={{ color: "#4CAF50" }}>● Active</span></td>
                      <td>5 hours ago</td>
                      <td>
                        <button className="btn-small">Edit</button>
                        <button className="btn-small danger">Remove</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Mike Davis</td>
                      <td>mike@premiumauto.com</td>
                      <td><span className="badge">Editor</span></td>
                      <td><span style={{ color: "#4CAF50" }}>● Active</span></td>
                      <td>1 day ago</td>
                      <td>
                        <button className="btn-small">Edit</button>
                        <button className="btn-small danger">Remove</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Integrations */}
            {settingsTab === "integrations" && (
              <div className="grid grid-2">
                <div className="card integration-card">
                  <div className="integration-header">
                    <div>
                      <h3>🔵 Google Business Profile</h3>
                      <p className="text-sm">Sync your business information and reviews</p>
                    </div>
                    <span className="badge success">Connected</span>
                  </div>
                  <div className="stat-row">
                    <span>Last Sync</span>
                    <span>10 min ago</span>
                  </div>
                  <div className="stat-row">
                    <span>Status</span>
                    <span style={{ color: "#4CAF50" }}>Healthy</span>
                  </div>
                  <button className="btn danger">Disconnect</button>
                </div>

                <div className="card integration-card">
                  <div className="integration-header">
                    <div>
                      <h3>📊 Google Analytics</h3>
                      <p className="text-sm">Track website traffic and behavior</p>
                    </div>
                    <span className="badge success">Connected</span>
                  </div>
                  <div className="stat-row">
                    <span>Last Sync</span>
                    <span>1 hour ago</span>
                  </div>
                  <div className="stat-row">
                    <span>Property</span>
                    <span>UA-123456789</span>
                  </div>
                  <button className="btn danger">Disconnect</button>
                </div>

                <div className="card integration-card">
                  <div className="integration-header">
                    <div>
                      <h3>🔍 Google Search Console</h3>
                      <p className="text-sm">Monitor search performance</p>
                    </div>
                    <span className="badge success">Connected</span>
                  </div>
                  <div className="stat-row">
                    <span>Last Sync</span>
                    <span>30 min ago</span>
                  </div>
                  <button className="btn danger">Disconnect</button>
                </div>

                <div className="card integration-card">
                  <div className="integration-header">
                    <div>
                      <h3>📘 Facebook</h3>
                      <p className="text-sm">Manage Facebook reviews and posts</p>
                    </div>
                    <span className="badge">Not Connected</span>
                  </div>
                  <button className="btn primary">Connect</button>
                </div>

                <div className="card integration-card">
                  <div className="integration-header">
                    <div>
                      <h3>⚡ Zapier</h3>
                      <p className="text-sm">Automate workflows with 5000+ apps</p>
                    </div>
                    <span className="badge success">Connected</span>
                  </div>
                  <div className="stat-row">
                    <span>Active Zaps</span>
                    <span>3</span>
                  </div>
                  <button className="btn">Manage Zaps</button>
                </div>

                <div className="card integration-card">
                  <div className="integration-header">
                    <div>
                      <h3>💼 CRM Integration</h3>
                      <p className="text-sm">Sync leads and customer data</p>
                    </div>
                    <span className="badge">Not Connected</span>
                  </div>
                  <button className="btn primary">Connect</button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {settingsTab === "notifications" && (
              <div>
                <div className="card mb-20">
                  <h3>Email Notifications</h3>
                  <div className="setting-item">
                    <div>
                      <strong>Enable Email Notifications</strong>
                      <p className="text-sm">Receive updates via email</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <strong>Daily Summary</strong>
                      <p className="text-sm">Receive daily performance report</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <strong>Opportunity Alerts</strong>
                      <p className="text-sm">Get notified of new opportunities</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="card mb-20">
                  <h3>Alert Preferences</h3>
                  <div className="setting-item">
                    <div>
                      <strong>Competitor Changes</strong>
                      <p className="text-sm">Alert when competitors make significant changes</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <strong>Ranking Drops</strong>
                      <p className="text-sm">Alert on keyword ranking decreases</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <strong>Negative Reviews</strong>
                      <p className="text-sm">Immediate notification of low ratings</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <strong>Schema Errors</strong>
                      <p className="text-sm">Alert when schema validation fails</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="card">
                  <h3>Slack Integration</h3>
                  <p className="text-sm" style={{ marginBottom: 15 }}>Send notifications to your Slack workspace</p>
                  <button className="btn primary">Connect Slack</button>
                </div>
              </div>
            )}

            {/* Automation Rules */}
            {settingsTab === "automation" && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3>Automation Rules</h3>
                  <button className="btn primary">+ Create Rule</button>
                </div>
                <div className="automation-list">
                  <div className="automation-item">
                    <div>
                      <strong>Auto-respond to 5-star reviews</strong>
                      <p className="text-sm">Trigger: New 5-star review → Action: Send thank you template</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                      <button className="btn-small">Edit</button>
                    </div>
                  </div>
                  <div className="automation-item">
                    <div>
                      <strong>Deploy FAQ schema on new content</strong>
                      <p className="text-sm">Trigger: Content published → Action: Generate & deploy FAQ schema</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                      <button className="btn-small">Edit</button>
                    </div>
                  </div>
                  <div className="automation-item">
                    <div>
                      <strong>Alert on competitor ranking change</strong>
                      <p className="text-sm">Trigger: Competitor moves up 3+ positions → Action: Send email alert</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <label className="toggle">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                      <button className="btn-small">Edit</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {settingsTab === "security" && (
              <div>
                <div className="card mb-20">
                  <h3>API Keys</h3>
                  <button className="btn primary" style={{ marginBottom: 15 }}>+ Generate New Key</button>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Key</th>
                        <th>Created</th>
                        <th>Last Used</th>
                        <th>Permissions</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Production API</td>
                        <td><code>sk_live_••••••••4e2a</code></td>
                        <td>Jan 15, 2025</td>
                        <td>2 hours ago</td>
                        <td><span className="badge success">Read/Write</span></td>
                        <td>
                          <button className="btn-small">View</button>
                          <button className="btn-small danger">Revoke</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Development</td>
                        <td><code>sk_test_••••••••9c1b</code></td>
                        <td>Feb 1, 2025</td>
                        <td>5 days ago</td>
                        <td><span className="badge">Read Only</span></td>
                        <td>
                          <button className="btn-small">View</button>
                          <button className="btn-small danger">Revoke</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="card mb-20">
                  <h3>Security Settings</h3>
                  <div className="setting-item">
                    <div>
                      <strong>Two-Factor Authentication</strong>
                      <p className="text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button className="btn primary">Enable 2FA</button>
                  </div>
                  <div className="setting-item">
                    <div>
                      <strong>Session Timeout</strong>
                      <p className="text-sm">Automatically log out after period of inactivity</p>
                    </div>
                    <select className="form-select">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>

                <div className="card">
                  <h3>Active Sessions</h3>
                  <div className="stat-row">
                    <div>
                      <strong>Chrome on MacOS</strong>
                      <p className="text-sm">Current session • Cape Coral, FL</p>
                    </div>
                    <span style={{ color: "#4CAF50" }}>● Active</span>
                  </div>
                  <div className="stat-row">
                    <div>
                      <strong>Mobile App on iPhone</strong>
                      <p className="text-sm">Last active 2 days ago • Miami, FL</p>
                    </div>
                    <button className="btn-small danger">Revoke</button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing */}
            {settingsTab === "billing" && (
              <div>
                <div className="grid grid-2 mb-20">
                  <div className="card primary">
                    <h3>Current Plan</h3>
                    <div className="metric-value">Pro</div>
                    <p>$299/month</p>
                    <button className="btn primary">Upgrade to Enterprise</button>
                  </div>
                  <div className="card">
                    <h3>Usage This Month</h3>
                    <div className="stat-row">
                      <span>API Calls</span>
                      <span>14,500 / 50,000</span>
                    </div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: "29%" }}></div>
                    </div>
                    <div className="stat-row">
                      <span>Reports Generated</span>
                      <span>23 / 100</span>
                    </div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: "23%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="card mb-20">
                  <h3>Payment Method</h3>
                  <div className="stat-row">
                    <div>
                      <strong>💳 Visa ending in 4242</strong>
                      <p className="text-sm">Expires 12/2026</p>
                    </div>
                    <button className="btn">Update</button>
                  </div>
                </div>

                <div className="card">
                  <h3>Billing History</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Oct 15, 2025</td>
                        <td>Pro Plan - Monthly</td>
                        <td>$299.00</td>
                        <td><span className="badge success">Paid</span></td>
                        <td><button className="btn-small">Download</button></td>
                      </tr>
                      <tr>
                        <td>Sep 15, 2025</td>
                        <td>Pro Plan - Monthly</td>
                        <td>$299.00</td>
                        <td><span className="badge success">Paid</span></td>
                        <td><button className="btn-small">Download</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs remain the same */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-3 mb-20">
              <div className="card primary"><h3>🔍 SEO</h3><div className="metric-value">87.3</div></div>
              <div className="card warning"><h3>🎯 AEO</h3><div className="metric-value">73.8</div></div>
              <div className="card danger"><h3>🤖 GEO</h3><div className="metric-value">65.2</div></div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal show" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal.title}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">{modal.body}</div>
          </div>
        </div>
      )}
    </div>
  );
}
