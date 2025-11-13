'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

interface CustomScenarioModalProps {
  domain: string;
  dealerId: string;
  currentRelevance: number;
  onClose: () => void;
  onSave: () => void;
}

export default function CustomScenarioModal({
  domain,
  dealerId,
  currentRelevance,
  onClose,
  onSave,
}: CustomScenarioModalProps) {
  const [scenarioName, setScenarioName] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState<Array<{
    type: string;
    target: string;
    delta: number;
    confidence: number;
    cost: number;
  }>>([]);

  const addAction = () => {
    setActions([
      ...actions,
      {
        type: 'improve_signal',
        target: 'aiv',
        delta: 5,
        confidence: 0.8,
        cost: 0,
      },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: string, value: any) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: value };
    setActions(updated);
  };

  const handleSave = async () => {
    if (!scenarioName || actions.length === 0) {
      alert('Please provide a scenario name and at least one action');
      return;
    }

    try {
      const res = await fetch('/api/relevance/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId,
          scenarioName,
          description,
          actions: actions.map((a) => ({
            type: a.type,
            target: a.target,
            delta: a.delta,
            confidence: a.confidence,
            cost: a.cost,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to save scenario');

      onSave();
    } catch (error) {
      console.error('Save scenario error:', error);
      alert('Failed to save scenario. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Create Custom Scenario</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Scenario Name
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g., Q1 Optimization Plan"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this scenario aims to achieve..."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-300">
                Actions
              </label>
              <button
                onClick={addAction}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Action
              </button>
            </div>

            <div className="space-y-3">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-white">
                      Action {index + 1}
                    </span>
                    <button
                      onClick={() => removeAction(index)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Type</label>
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="improve_signal">Improve Signal</option>
                        <option value="fix_issue">Fix Issue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target</label>
                      <select
                        value={action.target}
                        onChange={(e) => updateAction(index, 'target', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="aiv">AI Visibility</option>
                        <option value="zero_click">Zero-Click Shield</option>
                        <option value="ugc_health">UGC Health</option>
                        <option value="geo_trust">Geo Trust</option>
                        <option value="sgp_integrity">Schema Integrity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Impact (points)
                      </label>
                      <input
                        type="number"
                        value={action.delta}
                        onChange={(e) => updateAction(index, 'delta', parseFloat(e.target.value))}
                        min="0"
                        max="50"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Confidence (0-1)
                      </label>
                      <input
                        type="number"
                        value={action.confidence}
                        onChange={(e) => updateAction(index, 'confidence', parseFloat(e.target.value))}
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">
                        Estimated Cost ($)
                      </label>
                      <input
                        type="number"
                        value={action.cost}
                        onChange={(e) => updateAction(index, 'cost', parseFloat(e.target.value))}
                        min="0"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {actions.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No actions added yet. Click "Add Action" to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Save Scenario
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

