"use client";

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Types
interface AutoPilotConfig {
  enabled: boolean;
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  budget: {
    maxSpendPerMonth: number;
    maxTimePerWeek: number;
  };
  constraints: {
    requireApproval: boolean;
    excludeActions: string[];
    onlyDuringHours: { start: number; end: number };
  };
  goals: {
    targetSEOScore: number;
    targetLeadsPerMonth: number;
    targetROI: number;
  };
}

interface Action {
  id: string;
  type: 'deployment' | 'optimization' | 'content' | 'technical';
  name: string;
  description: string;
  impact: {
    seo: number;
    traffic: number;
    leads: number;
    revenue: number;
  };
  effort: {
    hours: number;
    cost: number;
    complexity: 'low' | 'medium' | 'high';
  };
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
  aiReasoning: string;
}

interface AutoPilotMetrics {
  totalActions: number;
  completedActions: number;
  pendingApproval: number;
  totalImpact: {
    seo: number;
    traffic: number;
    leads: number;
    revenue: number;
  };
  successRate: number;
  timeSaved: number;
  costSaved: number;
}

const AutoPilotMode = () => {
  const [config, setConfig] = useState<AutoPilotConfig>({
    enabled: false,
    aggressiveness: 'moderate',
    budget: {
      maxSpendPerMonth: 5000,
      maxTimePerWeek: 20
    },
    constraints: {
      requireApproval: true,
      excludeActions: [],
      onlyDuringHours: { start: 9, end: 17 }
    },
    goals: {
      targetSEOScore: 90,
      targetLeadsPerMonth: 200,
      targetROI: 300
    }
  });

  const [actions, setActions] = useState<Action[]>([]);
  const [metrics, setMetrics] = useState<AutoPilotMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Mock data for demonstration
  const mockActions: Action[] = [
    {
      id: '1',
      type: 'deployment',
      name: 'FAQ Schema Deployment',
      description: 'Deploy FAQ schema to service pages for featured snippets',
      impact: {
        seo: 5.2,
        traffic: 2400,
        leads: 156,
        revenue: 45000
      },
      effort: {
        hours: 8,
        cost: 1200,
        complexity: 'low'
      },
      confidence: 0.89,
      priority: 'high',
      status: 'pending',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      aiReasoning: 'High confidence opportunity with proven ROI. Service pages have high search volume but low featured snippet presence.'
    },
    {
      id: '2',
      type: 'optimization',
      name: 'Core Web Vitals Fix',
      description: 'Optimize page speed to improve Core Web Vitals scores',
      impact: {
        seo: 3.1,
        traffic: 1200,
        leads: 72,
        revenue: 22000
      },
      effort: {
        hours: 16,
        cost: 2400,
        complexity: 'medium'
      },
      confidence: 0.92,
      priority: 'high',
      status: 'executing',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      aiReasoning: 'Critical for SEO rankings. Current Core Web Vitals are below Google thresholds.'
    },
    {
      id: '3',
      type: 'content',
      name: 'Local SEO Content',
      description: 'Create location-specific content for service areas',
      impact: {
        seo: 4.8,
        traffic: 1800,
        leads: 98,
        revenue: 32000
      },
      effort: {
        hours: 24,
        cost: 3600,
        complexity: 'high'
      },
      confidence: 0.85,
      priority: 'medium',
      status: 'completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      aiReasoning: 'Local search presence is 23% below competitors. Content strategy can improve GEO scores significantly.'
    }
  ];

  useEffect(() => {
    loadActions();
    calculateMetrics();
  }, []);

  useEffect(() => {
    if (config.enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }, [config.enabled]);

  const loadActions = () => {
    setActions(mockActions);
  };

  const calculateMetrics = () => {
    const totalActions = actions.length;
    const completedActions = actions.filter(a => a.status === 'completed').length;
    const pendingApproval = actions.filter(a => a.status === 'pending').length;
    
    const totalImpact = actions.reduce((acc, action) => ({
      seo: acc.seo + action.impact.seo,
      traffic: acc.traffic + action.impact.traffic,
      leads: acc.leads + action.impact.leads,
      revenue: acc.revenue + action.impact.revenue
    }), { seo: 0, traffic: 0, leads: 0, revenue: 0 });

    const successRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
    const timeSaved = actions.reduce((acc, action) => acc + action.effort.hours, 0);
    const costSaved = actions.reduce((acc, action) => acc + action.effort.cost, 0);

    setMetrics({
      totalActions,
      completedActions,
      pendingApproval,
      totalImpact,
      successRate,
      timeSaved,
      costSaved
    });
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast.success('Auto-pilot monitoring started');
    
    // Simulate continuous monitoring
    const interval = setInterval(() => {
      if (config.enabled) {
        checkForOpportunities();
        setLastCheck(new Date());
      } else {
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds for demo

    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast.info('Auto-pilot monitoring stopped');
  };

  const checkForOpportunities = () => {
    // Simulate AI analysis
    const shouldCreateAction = Math.random() > 0.7; // 30% chance
    
    if (shouldCreateAction) {
      const newAction: Action = {
        id: Date.now().toString(),
        type: 'optimization',
        name: 'Automated SEO Optimization',
        description: 'AI detected opportunity for keyword optimization',
        impact: {
          seo: Math.random() * 3 + 1,
          traffic: Math.floor(Math.random() * 1000) + 500,
          leads: Math.floor(Math.random() * 50) + 25,
          revenue: Math.floor(Math.random() * 20000) + 10000
        },
        effort: {
          hours: Math.floor(Math.random() * 8) + 4,
          cost: Math.floor(Math.random() * 2000) + 1000,
          complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
        },
        confidence: Math.random() * 0.3 + 0.7,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        status: config.constraints.requireApproval ? 'pending' : 'approved',
        timestamp: new Date(),
        aiReasoning: 'AI analysis detected optimization opportunity based on current performance metrics.'
      };

      setActions(prev => [newAction, ...prev]);
      
      if (config.constraints.requireApproval) {
        toast.info('New action requires approval');
      } else {
        executeAction(newAction);
      }
    }
  };

  const executeAction = async (action: Action) => {
    setActions(prev => 
      prev.map(a => 
        a.id === action.id 
          ? { ...a, status: 'executing' as any }
          : a
      )
    );

    toast.loading(`Executing ${action.name}...`);

    try {
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setActions(prev => 
        prev.map(a => 
          a.id === action.id 
            ? { ...a, status: 'completed' as any }
            : a
        )
      );

      toast.success(`${action.name} completed successfully!`);
      calculateMetrics();
    } catch (error) {
      setActions(prev => 
        prev.map(a => 
          a.id === action.id 
            ? { ...a, status: 'failed' as any }
            : a
        )
      );

      toast.error(`${action.name} failed to execute`);
    }
  };

  const approveAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      executeAction(action);
    }
  };

  const rejectAction = (actionId: string) => {
    setActions(prev => 
      prev.map(a => 
        a.id === actionId 
          ? { ...a, status: 'rejected' as any }
          : a
      )
    );
    toast.info('Action rejected');
  };

  const updateConfig = (updates: Partial<AutoPilotConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    toast.success('Configuration updated');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#3b82f6',
      rejected: '#ef4444',
      executing: '#8b5cf6',
      completed: '#10b981',
      failed: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#6b7280',
      medium: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="autopilot-mode">
      <div className="autopilot-header">
        <h2>🤖 Auto-Pilot Mode</h2>
        <p>AI continuously monitors and takes actions to optimize your dealership's performance</p>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <div className="status-card">
          <div className="status-indicator">
            <div className={`status-dot ${config.enabled ? 'active' : 'inactive'}`}></div>
            <span>{config.enabled ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="status-details">
            <div className="status-item">
              <span className="label">Mode:</span>
              <span className="value">{config.aggressiveness}</span>
            </div>
            <div className="status-item">
              <span className="label">Approval Required:</span>
              <span className="value">{config.constraints.requireApproval ? 'Yes' : 'No'}</span>
            </div>
            <div className="status-item">
              <span className="label">Last Check:</span>
              <span className="value">
                {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Toggle */}
        <div className="quick-toggle">
          <button
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className={`toggle-button ${config.enabled ? 'enabled' : 'disabled'}`}
          >
            {config.enabled ? '🟢 Stop Auto-Pilot' : '🔴 Start Auto-Pilot'}
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{metrics.totalActions}</div>
            <div className="metric-label">Total Actions</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.completedActions}</div>
            <div className="metric-label">Completed</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.pendingApproval}</div>
            <div className="metric-label">Pending Approval</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.successRate.toFixed(0)}%</div>
            <div className="metric-label">Success Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.timeSaved}h</div>
            <div className="metric-label">Time Saved</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">${(metrics.costSaved / 1000).toFixed(0)}K</div>
            <div className="metric-label">Cost Saved</div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="config-panel">
        <h3>Configuration</h3>
        <div className="config-grid">
          <div className="config-section">
            <h4>Aggressiveness</h4>
            <select
              value={config.aggressiveness}
              onChange={(e) => updateConfig({ aggressiveness: e.target.value as any })}
              className="config-select"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <div className="config-section">
            <h4>Budget Limits</h4>
            <div className="config-inputs">
              <div className="input-group">
                <label>Max Spend/Month</label>
                <input
                  type="number"
                  value={config.budget.maxSpendPerMonth}
                  onChange={(e) => updateConfig({ 
                    budget: { ...config.budget, maxSpendPerMonth: Number(e.target.value) }
                  })}
                  className="config-input"
                />
              </div>
              <div className="input-group">
                <label>Max Hours/Week</label>
                <input
                  type="number"
                  value={config.budget.maxTimePerWeek}
                  onChange={(e) => updateConfig({ 
                    budget: { ...config.budget, maxTimePerWeek: Number(e.target.value) }
                  })}
                  className="config-input"
                />
              </div>
            </div>
          </div>

          <div className="config-section">
            <h4>Goals</h4>
            <div className="config-inputs">
              <div className="input-group">
                <label>Target SEO Score</label>
                <input
                  type="number"
                  value={config.goals.targetSEOScore}
                  onChange={(e) => updateConfig({ 
                    goals: { ...config.goals, targetSEOScore: Number(e.target.value) }
                  })}
                  className="config-input"
                />
              </div>
              <div className="input-group">
                <label>Target Leads/Month</label>
                <input
                  type="number"
                  value={config.goals.targetLeadsPerMonth}
                  onChange={(e) => updateConfig({ 
                    goals: { ...config.goals, targetLeadsPerMonth: Number(e.target.value) }
                  })}
                  className="config-input"
                />
              </div>
            </div>
          </div>

          <div className="config-section">
            <h4>Constraints</h4>
            <div className="config-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.constraints.requireApproval}
                  onChange={(e) => updateConfig({ 
                    constraints: { ...config.constraints, requireApproval: e.target.checked }
                  })}
                />
                Require approval for actions
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="actions-section">
        <h3>Recent Actions</h3>
        <div className="actions-list">
          {actions.map((action) => (
            <div key={action.id} className="action-card">
              <div className="action-header">
                <div className="action-title">
                  <h4>{action.name}</h4>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(action.status) }}
                  >
                    {action.status}
                  </span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(action.priority) }}
                  >
                    {action.priority}
                  </span>
                </div>
                <div className="action-time">
                  {action.timestamp.toLocaleTimeString()}
                </div>
              </div>

              <p className="action-description">{action.description}</p>

              <div className="action-metrics">
                <div className="metric">
                  <span className="metric-label">Confidence</span>
                  <span className="metric-value">{(action.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Impact</span>
                  <span className="metric-value">+{action.impact.seo.toFixed(1)} SEO</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Effort</span>
                  <span className="metric-value">{action.effort.hours}h</span>
                </div>
              </div>

              <div className="ai-reasoning">
                <strong>AI Reasoning:</strong> {action.aiReasoning}
              </div>

              {action.status === 'pending' && config.constraints.requireApproval && (
                <div className="action-approval">
                  <button
                    onClick={() => approveAction(action.id)}
                    className="approve-button"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectAction(action.id)}
                    className="reject-button"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoPilotMode;
