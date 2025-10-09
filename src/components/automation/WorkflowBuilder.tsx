/**
 * WorkflowBuilder Component - Profound-inspired
 * Build time-saving workflows with human-in-the-loop checkpoints
 */

import React, { useState } from 'react';

interface Trigger {
  id: string;
  type: 'visibility_drop' | 'competitor_rank' | 'mention_detected' | 'sentiment_change' | 'rank_change';
  condition: string;
  threshold?: number;
  timeframe?: string;
}

interface Action {
  id: string;
  type: 'alert' | 'auto_optimize' | 'report' | 'monitor' | 'webhook';
  config: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: Trigger;
  actions: Action[];
  enabled: boolean;
  lastRun?: string;
  runs: number;
}

interface WorkflowBuilderProps {
  workflows: Workflow[];
  onSave: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  className?: string;
}

export function WorkflowBuilder({
  workflows,
  onSave,
  onDelete,
  onToggle,
  className = ''
}: WorkflowBuilderProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const triggerTypes = [
    { value: 'visibility_drop', label: 'AI Visibility Score drops below', icon: '📉' },
    { value: 'competitor_rank', label: 'Competitor ranks above you in', icon: '🏆' },
    { value: 'mention_detected', label: 'New mention detected in', icon: '🔍' },
    { value: 'sentiment_change', label: 'Sentiment drops below', icon: '😞' },
    { value: 'rank_change', label: 'Rank changes by more than', icon: '📊' },
  ];

  const actionTypes = [
    { value: 'alert', label: 'Send Alert', icon: '🚨', description: 'Notify team via Slack, email, or SMS' },
    { value: 'auto_optimize', label: 'Auto-Optimize', icon: '⚡', description: 'Automatically update schema, content, or settings' },
    { value: 'report', label: 'Generate Report', icon: '📊', description: 'Create and send weekly/monthly reports' },
    { value: 'monitor', label: 'Start Monitoring', icon: '👁️', description: 'Begin tracking specific keywords or competitors' },
    { value: 'webhook', label: 'Webhook', icon: '🔗', description: 'Send data to external system' },
  ];

  const handleCreateWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: 'New Workflow',
      description: 'Automated workflow for AI visibility management',
      trigger: {
        id: 'trigger_1',
        type: 'visibility_drop',
        condition: 'below',
        threshold: 50,
        timeframe: '24h'
      },
      actions: [{
        id: 'action_1',
        type: 'alert',
        config: { channel: 'slack', message: 'Visibility dropped below threshold' }
      }],
      enabled: false,
      runs: 0
    };
    setEditingWorkflow(newWorkflow);
    setIsCreating(true);
  };

  const handleSaveWorkflow = () => {
    if (editingWorkflow) {
      onSave(editingWorkflow);
      setEditingWorkflow(null);
      setIsCreating(false);
    }
  };

  const getTriggerIcon = (type: string) => {
    const trigger = triggerTypes.find(t => t.value === type);
    return trigger?.icon || '⚡';
  };

  const getActionIcon = (type: string) => {
    const action = actionTypes.find(a => a.value === type);
    return action?.icon || '⚡';
  };

  return (
    <div className={`bg-white/5 p-6 rounded-lg border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Automated Workflows</h3>
          <p className="text-gray-400 text-sm">Build time-saving workflows with human-in-the-loop checkpoints</p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          + Create Workflow
        </button>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTriggerIcon(workflow.trigger.type)}</span>
                  <span className="text-white font-medium">{workflow.name}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  workflow.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {workflow.enabled ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggle(workflow.id)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    workflow.enabled 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {workflow.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => setEditingWorkflow(workflow)}
                  className="px-3 py-1 rounded text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(workflow.id)}
                  className="px-3 py-1 rounded text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-3">{workflow.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Runs: {workflow.runs}</span>
              {workflow.lastRun && <span>Last run: {workflow.lastRun}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isCreating && editingWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 rounded-lg p-6 w-full max-w-2xl">
            <h4 className="text-lg font-semibold text-white mb-4">
              {editingWorkflow.id.startsWith('workflow_') ? 'Create Workflow' : 'Edit Workflow'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={editingWorkflow.name}
                  onChange={(e) => setEditingWorkflow({
                    ...editingWorkflow,
                    name: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editingWorkflow.description}
                  onChange={(e) => setEditingWorkflow({
                    ...editingWorkflow,
                    description: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trigger</label>
                <select
                  value={editingWorkflow.trigger.type}
                  onChange={(e) => setEditingWorkflow({
                    ...editingWorkflow,
                    trigger: {
                      ...editingWorkflow.trigger,
                      type: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {triggerTypes.map((trigger) => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.icon} {trigger.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Actions</label>
                <div className="space-y-2">
                  {editingWorkflow.actions.map((action, index) => (
                    <div key={action.id} className="flex items-center gap-2">
                      <select
                        value={action.type}
                        onChange={(e) => {
                          const newActions = [...editingWorkflow.actions];
                          newActions[index] = { ...action, type: e.target.value as any };
                          setEditingWorkflow({ ...editingWorkflow, actions: newActions });
                        }}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        {actionTypes.map((actionType) => (
                          <option key={actionType.value} value={actionType.value}>
                            {actionType.icon} {actionType.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const newActions = editingWorkflow.actions.filter((_, i) => i !== index);
                          setEditingWorkflow({ ...editingWorkflow, actions: newActions });
                        }}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newAction: Action = {
                        id: `action_${Date.now()}`,
                        type: 'alert',
                        config: {}
                      };
                      setEditingWorkflow({
                        ...editingWorkflow,
                        actions: [...editingWorkflow.actions, newAction]
                      });
                    }}
                    className="w-full px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    + Add Action
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingWorkflow(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkflow}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
