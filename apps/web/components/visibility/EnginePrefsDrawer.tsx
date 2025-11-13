"use client";

import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

interface EnginePrefsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function EnginePrefsDrawer({ open, onClose }: EnginePrefsDrawerProps) {
  const [weights, setWeights] = useState({
    ChatGPT: 0.35,
    Perplexity: 0.25,
    Gemini: 0.25,
    Copilot: 0.15,
  });

  const [thresholds, setThresholds] = useState({
    minPresence: 50,
    alertOnDrop: true,
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('dai:engine_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.weights) setWeights(parsed.weights);
        if (parsed.thresholds) setThresholds(parsed.thresholds);
      } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('dai:engine_prefs', JSON.stringify({ weights, thresholds }));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-neural-900 border border-neural-800 rounded-t-2xl sm:rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-neural-800">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-clarity-blue" />
            <h2 className="text-xl font-semibold text-white">Engine Preferences</h2>
          </div>
          <button onClick={onClose} className="text-neural-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Engine Weights */}
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Engine Weights</h3>
            <div className="space-y-3">
              {Object.entries(weights).map(([engine, weight]) => (
                <div key={engine} className="flex items-center justify-between">
                  <label className="text-sm text-neural-300">{engine}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={weight}
                      onChange={(e) => setWeights({ ...weights, [engine]: parseFloat(e.target.value) })}
                      className="w-32"
                    />
                    <span className="text-sm text-white w-12 text-right">{(weight * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-neural-500">
              Total: {(Object.values(weights).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Thresholds */}
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Alert Thresholds</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-neural-300">Minimum Presence %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={thresholds.minPresence}
                  onChange={(e) => setThresholds({ ...thresholds, minPresence: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 bg-neural-800 border border-neural-700 rounded text-white text-sm"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={thresholds.alertOnDrop}
                  onChange={(e) => setThresholds({ ...thresholds, alertOnDrop: e.target.checked })}
                  className="w-4 h-4 text-clarity-blue rounded focus:ring-clarity-blue"
                />
                <span className="text-sm text-neural-300">Alert on presence drop</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neural-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neural-700 text-neural-300 rounded-lg hover:bg-neural-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-clarity-blue text-white rounded-lg hover:bg-clarity-cyan transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

