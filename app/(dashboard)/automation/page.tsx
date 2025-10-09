/**
 * Automation Dashboard - Profound-inspired
 * Central hub for workflow management and alert monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import { WorkflowBuilder } from '@/components/automation/WorkflowBuilder';
import { AlertCenter } from '@/components/automation/AlertCenter';
import { automationEngine, Workflow, Alert } from '@/lib/automation/AutomationEngine';

export default function AutomationDashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<'workflows' | 'alerts'>('workflows');
  const [dealerId] = useState('dealer_123'); // In production, get from user context

  useEffect(() => {
    loadData();
  }, [dealerId]);

  const loadData = () => {
    const dealerWorkflows = automationEngine.getWorkflows(dealerId);
    const dealerAlerts = automationEngine.getAlerts(dealerId);
    setWorkflows(dealerWorkflows);
    setAlerts(dealerAlerts);
  };

  const handleSaveWorkflow = (workflow: Workflow) => {
    if (workflow.id.startsWith('workflow_')) {
      // New workflow
      const newWorkflow = automationEngine.createWorkflow({
        name: workflow.name,
        description: workflow.description,
        trigger: workflow.trigger,
        actions: workflow.actions,
        enabled: workflow.enabled,
        dealerId: dealerId
      });
      setWorkflows(prev => [...prev, newWorkflow]);
    } else {
      // Update existing workflow
      const updatedWorkflow = automationEngine.updateWorkflow(workflow.id, workflow);
      if (updatedWorkflow) {
        setWorkflows(prev => prev.map(w => w.id === workflow.id ? updatedWorkflow : w));
      }
    }
  };

  const handleDeleteWorkflow = (id: string) => {
    const deleted = automationEngine.deleteWorkflow(id);
    if (deleted) {
      setWorkflows(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleToggleWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      const updatedWorkflow = automationEngine.updateWorkflow(id, { enabled: !workflow.enabled });
      if (updatedWorkflow) {
        setWorkflows(prev => prev.map(w => w.id === id ? updatedWorkflow : w));
      }
    }
  };

  const handleMarkAlertRead = (id: string) => {
    const success = automationEngine.markAlertRead(id);
    if (success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    }
  };

  const handleMarkAllAlertsRead = () => {
    alerts.forEach(alert => {
      if (!alert.read) {
        automationEngine.markAlertRead(alert.id);
      }
    });
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleDismissAlert = (id: string) => {
    const success = automationEngine.dismissAlert(id);
    if (success) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleTestWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    // Simulate metrics for testing
    const testMetrics = {
      aiVisibilityScore: 35,
      competitorRank: 3,
      newMentions: 5,
      sentimentScore: 65,
      rankChange: -2
    };

    await automationEngine.checkTriggers(dealerId, testMetrics);
    loadData(); // Reload to show new alerts
  };

  const workflowStats = {
    total: workflows.length,
    active: workflows.filter(w => w.enabled).length,
    totalRuns: workflows.reduce((sum, w) => sum + w.runs, 0),
    lastRun: workflows.reduce((latest, w) => {
      if (!w.lastRun) return latest;
      if (!latest) return w.lastRun;
      return new Date(w.lastRun) > new Date(latest) ? w.lastRun : latest;
    }, null as string | null)
  };

  const alertStats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.read).length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    actionRequired: alerts.filter(a => a.actionRequired).length
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Automation Center</h1>
          <p className="text-gray-400 mt-2">Build time-saving workflows and monitor AI visibility alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Active Workflows</h3>
            <div className="text-3xl font-bold text-blue-400">{workflowStats.active}</div>
            <p className="text-sm text-gray-400">of {workflowStats.total} total</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Total Runs</h3>
            <div className="text-3xl font-bold text-green-400">{workflowStats.totalRuns}</div>
            <p className="text-sm text-gray-400">workflow executions</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Unread Alerts</h3>
            <div className="text-3xl font-bold text-orange-400">{alertStats.unread}</div>
            <p className="text-sm text-gray-400">of {alertStats.total} total</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Critical Alerts</h3>
            <div className="text-3xl font-bold text-red-400">{alertStats.critical}</div>
            <p className="text-sm text-gray-400">require immediate attention</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'workflows'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Alerts ({alertStats.unread > 0 ? `${alertStats.unread} unread` : 'All read'})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'workflows' ? (
          <WorkflowBuilder
            workflows={workflows}
            onSave={handleSaveWorkflow}
            onDelete={handleDeleteWorkflow}
            onToggle={handleToggleWorkflow}
          />
        ) : (
          <AlertCenter
            alerts={alerts}
            onMarkRead={handleMarkAlertRead}
            onMarkAllRead={handleMarkAllAlertsRead}
            onDismiss={handleDismissAlert}
          />
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white/5 p-6 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('workflows')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Create New Workflow
            </button>
            <button
              onClick={() => {
                // Simulate a test run
                workflows.forEach(w => handleTestWorkflow(w.id));
              }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Test All Workflows
            </button>
            <button
              onClick={handleMarkAllAlertsRead}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Mark All Alerts Read
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
