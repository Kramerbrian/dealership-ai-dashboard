'use client';
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    };
    dashboard: {
      defaultTab: string;
      layout: any[];
      widgets: string[];
      refreshInterval: number;
    };
    ai: {
      personality: 'professional' | 'friendly' | 'technical' | 'casual';
      verbosity: 'minimal' | 'standard' | 'detailed';
      suggestions: boolean;
      autoActions: boolean;
    };
  };
  behavior: {
    lastActive: Date;
    sessionDuration: number;
    clickPatterns: string[];
    favoriteFeatures: string[];
    usageFrequency: Record<string, number>;
    performanceMetrics: {
      tasksCompleted: number;
      timeSaved: number;
      accuracy: number;
    };
  };
  triggers: BehavioralTrigger[];
}

interface BehavioralTrigger {
  id: string;
  name: string;
  condition: {
    type: 'time' | 'action' | 'data' | 'performance';
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'pattern';
    value: any;
    threshold?: number;
  };
  action: {
    type: 'notification' | 'automation' | 'ui_change' | 'data_highlight';
    target: string;
    parameters: any;
  };
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered?: Date;
}

interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'data' | 'workflow' | 'ai';
  conditions: any[];
  actions: any[];
  active: boolean;
}

const AdvancedPersonalization: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-1',
    name: 'Demo User',
    role: 'manager',
    preferences: {
      theme: 'auto',
      language: 'en-US',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        sms: false,
        frequency: 'hourly'
      },
      dashboard: {
        defaultTab: 'overview',
        layout: [],
        widgets: ['kpi-cards', 'charts', 'alerts'],
        refreshInterval: 30000
      },
      ai: {
        personality: 'professional',
        verbosity: 'standard',
        suggestions: true,
        autoActions: false
      }
    },
    behavior: {
      lastActive: new Date(),
      sessionDuration: 0,
      clickPatterns: [],
      favoriteFeatures: ['ai-chat', 'predictions', '3d-landscape'],
      usageFrequency: {},
      performanceMetrics: {
        tasksCompleted: 0,
        timeSaved: 0,
        accuracy: 0
      }
    },
    triggers: []
  });

  const [personalizationRules, setPersonalizationRules] = useState<PersonalizationRule[]>([
    {
      id: 'rule-1',
      name: 'Auto-refresh on data changes',
      description: 'Automatically refresh dashboard when new data is available',
      category: 'data',
      conditions: [{ type: 'data_change', field: 'last_updated', operator: 'greater_than' }],
      actions: [{ type: 'refresh_dashboard' }],
      active: true
    },
    {
      id: 'rule-2',
      name: 'Highlight anomalies',
      description: 'Highlight unusual patterns in data with visual indicators',
      category: 'ui',
      conditions: [{ type: 'anomaly_detected', threshold: 0.8 }],
      actions: [{ type: 'highlight_element', color: 'red', animation: 'pulse' }],
      active: true
    },
    {
      id: 'rule-3',
      name: 'Smart notifications',
      description: 'Send notifications based on user behavior patterns',
      category: 'workflow',
      conditions: [{ type: 'inactivity', duration: 300000 }],
      actions: [{ type: 'send_notification', message: 'Check for updates' }],
      active: true
    }
  ]);

  const [isTracking, setIsTracking] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);

  // Behavioral tracking
  useEffect(() => {
    if (!isTracking) return;

    const trackEvent = (event: string, data?: any) => {
      setUserProfile(prev => ({
        ...prev,
        behavior: {
          ...prev.behavior,
          clickPatterns: [...prev.behavior.clickPatterns.slice(-99), event],
          usageFrequency: {
            ...(prev.behavior as any).usageFrequency,
            [event]: ((prev.behavior.usageFrequency as any)[event] || 0) + 1
          }
        }
      }));
    };

    // Track various user interactions
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const className = target.className;
      trackEvent(`click_${elementType}_${className.split(' ')[0]}`);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      trackEvent(`keypress_${e.key}`);
    };

    const handleScroll = () => {
      trackEvent('scroll');
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [isTracking]);

  // Generate behavioral insights
  useEffect(() => {
    const generateInsights = () => {
      const newInsights = [
        {
          id: 'insight-1',
          type: 'usage_pattern',
          title: 'Peak Activity Hours',
          description: 'You\'re most active between 9-11 AM and 2-4 PM',
          confidence: 0.85,
          actionable: true,
          suggestion: 'Schedule important tasks during these hours'
        },
        {
          id: 'insight-2',
          type: 'feature_preference',
          title: 'Favorite Features',
          description: 'You frequently use AI Chat and 3D Landscape features',
          confidence: 0.92,
          actionable: true,
          suggestion: 'Consider adding these to your default dashboard layout'
        },
        {
          id: 'insight-3',
          type: 'efficiency_opportunity',
          title: 'Workflow Optimization',
          description: 'You could save 15 minutes daily by using keyboard shortcuts',
          confidence: 0.78,
          actionable: true,
          suggestion: 'Enable keyboard shortcuts for common actions'
        }
      ];
      setInsights(newInsights);
    };

    generateInsights();
  }, [userProfile.behavior]);

  const updatePreference = (category: string, key: string, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...(prev.preferences[category as keyof typeof prev.preferences] as any),
          [key]: value
        }
      }
    }));
    toast.success('Preference updated');
  };

  const addBehavioralTrigger = (trigger: Omit<BehavioralTrigger, 'id'>) => {
    const newTrigger: BehavioralTrigger = {
      ...trigger,
      id: `trigger-${Date.now()}`
    };
    setUserProfile(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger]
    }));
    toast.success('Behavioral trigger added');
  };

  const toggleTrigger = (triggerId: string) => {
    setUserProfile(prev => ({
      ...prev,
      triggers: prev.triggers.map(trigger =>
        trigger.id === triggerId
          ? { ...trigger, enabled: !trigger.enabled }
          : trigger
      )
    }));
  };

  const applyPersonalizationRule = (ruleId: string) => {
    const rule = personalizationRules.find(r => r.id === ruleId);
    if (rule) {
      toast.success(`Applied rule: ${rule.name}`);
      // In a real app, this would trigger the actual personalization logic
    }
  };

  const exportProfile = () => {
    const dataStr = JSON.stringify(userProfile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-profile.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Profile exported');
  };

  return (
    <div className="advanced-personalization">
      <h3>🎯 Advanced Personalization & Behavioral Triggers</h3>
      <p>AI-powered personalization that adapts to your behavior and preferences.</p>

      {/* User Profile Section */}
      <div className="profile-section">
        <h4>User Profile & Preferences</h4>
        <div className="profile-grid">
          <div className="profile-card">
            <h5>Basic Info</h5>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={userProfile.role}
                onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value as any }))}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="profile-card">
            <h5>Dashboard Preferences</h5>
            <div className="form-group">
              <label>Default Tab</label>
              <select
                value={userProfile.preferences.dashboard.defaultTab}
                onChange={(e) => updatePreference('dashboard', 'defaultTab', e.target.value)}
              >
                <option value="overview">Overview</option>
                <option value="ai-chat">AI Chat</option>
                <option value="predictions">Predictions</option>
                <option value="3d-landscape">3D Landscape</option>
              </select>
            </div>
            <div className="form-group">
              <label>Refresh Interval (seconds)</label>
              <input
                type="number"
                value={userProfile.preferences.dashboard.refreshInterval / 1000}
                onChange={(e) => updatePreference('dashboard', 'refreshInterval', parseInt(e.target.value) * 1000)}
              />
            </div>
          </div>

          <div className="profile-card">
            <h5>AI Preferences</h5>
            <div className="form-group">
              <label>AI Personality</label>
              <select
                value={userProfile.preferences.ai.personality}
                onChange={(e) => updatePreference('ai', 'personality', e.target.value)}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="technical">Technical</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div className="form-group">
              <label>Verbosity Level</label>
              <select
                value={userProfile.preferences.ai.verbosity}
                onChange={(e) => updatePreference('ai', 'verbosity', e.target.value)}
              >
                <option value="minimal">Minimal</option>
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Triggers */}
      <div className="triggers-section">
        <h4>Behavioral Triggers</h4>
        <div className="triggers-controls">
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`tracking-button ${isTracking ? 'active' : ''}`}
          >
            {isTracking ? '🛑 Stop Tracking' : '▶️ Start Tracking'}
          </button>
          <button onClick={exportProfile} className="export-button">
            📤 Export Profile
          </button>
        </div>

        <div className="triggers-list">
          {userProfile.triggers.map(trigger => (
            <div key={trigger.id} className={`trigger-card ${trigger.enabled ? 'enabled' : 'disabled'}`}>
              <div className="trigger-header">
                <h6>{trigger.name}</h6>
                <div className="trigger-controls">
                  <span className={`priority-badge ${trigger.priority}`}>
                    {trigger.priority}
                  </span>
                  <button
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`toggle-button ${trigger.enabled ? 'on' : 'off'}`}
                  >
                    {trigger.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              <div className="trigger-details">
                <p><strong>Condition:</strong> {trigger.condition.type} {trigger.condition.operator} {trigger.condition.value}</p>
                <p><strong>Action:</strong> {trigger.action.type} on {trigger.action.target}</p>
                {trigger.lastTriggered && (
                  <p><strong>Last Triggered:</strong> {new Date(trigger.lastTriggered).toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalization Rules */}
      <div className="rules-section">
        <h4>Personalization Rules</h4>
        <div className="rules-grid">
          {personalizationRules.map(rule => (
            <div key={rule.id} className={`rule-card ${rule.active ? 'active' : 'inactive'}`}>
              <div className="rule-header">
                <h6>{rule.name}</h6>
                <span className={`status-badge ${rule.active ? 'active' : 'inactive'}`}>
                  {rule.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="rule-description">{rule.description}</p>
              <div className="rule-actions">
                <button
                  onClick={() => applyPersonalizationRule(rule.id)}
                  className="apply-button"
                >
                  Apply Rule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="insights-section">
        <h4>AI-Generated Insights</h4>
        <div className="insights-grid">
          {insights.map(insight => (
            <div key={insight.id} className="insight-card">
              <div className="insight-header">
                <h6>{insight.title}</h6>
                <span className="confidence-badge">
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
              </div>
              <p className="insight-description">{insight.description}</p>
              {insight.actionable && (
                <div className="insight-suggestion">
                  <strong>Suggestion:</strong> {insight.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Behavior Analytics */}
      <div className="analytics-section">
        <h4>Behavior Analytics</h4>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h6>Session Duration</h6>
            <div className="metric-value">
              {Math.round(userProfile.behavior.sessionDuration / 60000)} minutes
            </div>
          </div>
          <div className="analytics-card">
            <h6>Tasks Completed</h6>
            <div className="metric-value">
              {userProfile.behavior.performanceMetrics.tasksCompleted}
            </div>
          </div>
          <div className="analytics-card">
            <h6>Time Saved</h6>
            <div className="metric-value">
              {userProfile.behavior.performanceMetrics.timeSaved} minutes
            </div>
          </div>
          <div className="analytics-card">
            <h6>Accuracy</h6>
            <div className="metric-value">
              {userProfile.behavior.performanceMetrics.accuracy}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPersonalization;
