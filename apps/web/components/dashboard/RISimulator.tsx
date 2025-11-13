'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  Target, 
  Zap,
  BarChart3,
  Eye,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import CustomScenarioModal from './CustomScenarioModal';

interface SimulatorScenario {
  id: string;
  name: string;
  description: string;
  changes: {
    action: string;
    relevanceImpact: number;
    clickImpact: number;
    zeroClickImpact: number;
    cost: string;
    time: string;
  }[];
}

interface RISimulatorProps {
  domain: string;
  dealerId: string;
  currentRelevance: number;
  onSimulationComplete?: (results: any) => void;
}

export default function RISimulator({ 
  domain, 
  dealerId, 
  currentRelevance,
  onSimulationComplete 
}: RISimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [simulatedRelevance, setSimulatedRelevance] = useState(currentRelevance);
  const [simulatedClicks, setSimulatedClicks] = useState(0);
  const [simulatedZeroClicks, setSimulatedZeroClicks] = useState(0);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const [customScenarios, setCustomScenarios] = useState<SimulatorScenario[]>([]);
  const [showCustomScenarioModal, setShowCustomScenarioModal] = useState(false);

  const [templates, setTemplates] = useState<SimulatorScenario[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchCustomScenarios();
    fetchTemplates();
  }, [dealerId]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/scenarios/templates');
      if (res.ok) {
        const data = await res.json();
        const converted = data.templates.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          changes: t.actions.map((a: any) => ({
            action: a.description || a.type,
            relevanceImpact: a.delta || 0,
            clickImpact: 0,
            zeroClickImpact: 0,
            cost: a.cost ? `$${a.cost}` : '$0',
            time: 'varies',
          })),
        }));
        setTemplates(converted);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchCustomScenarios = async () => {
    try {
      const res = await fetch(`/api/relevance/scenarios?dealerId=${dealerId}`);
      if (res.ok) {
        const data = await res.json();
        // Convert API scenarios to component format
        const converted = data.scenarios.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          changes: s.actions.map((a: any) => ({
            action: a.action || a.type,
            relevanceImpact: a.delta || a.impact || 0,
            clickImpact: 0,
            zeroClickImpact: 0,
            cost: s.roi?.cost ? `$${s.roi.cost}` : '$0',
            time: 'varies',
          })),
        }));
        setCustomScenarios(converted);
      }
    } catch (error) {
      console.error('Failed to fetch custom scenarios:', error);
    }
  };

  const scenarios: SimulatorScenario[] = [
    {
      id: 'schema-optimization',
      name: 'Schema Optimization',
      description: 'Add comprehensive structured data markup',
      changes: [
        {
          action: 'Add AutoDealer schema',
          relevanceImpact: 12,
          clickImpact: 8,
          zeroClickImpact: 15,
          cost: '$0',
          time: '2 hours'
        },
        {
          action: 'Enhance FAQ schema',
          relevanceImpact: 8,
          clickImpact: 5,
          zeroClickImpact: 12,
          cost: '$0',
          time: '3 hours'
        },
        {
          action: 'Add LocalBusiness schema',
          relevanceImpact: 6,
          clickImpact: 4,
          zeroClickImpact: 8,
          cost: '$0',
          time: '1 hour'
        },
      ],
    },
    {
      id: 'content-enhancement',
      name: 'Content Enhancement',
      description: 'Improve content relevance and depth',
      changes: [
        {
          action: 'Add vehicle-specific FAQs',
          relevanceImpact: 15,
          clickImpact: 10,
          zeroClickImpact: 18,
          cost: '$200',
          time: '4 hours'
        },
        {
          action: 'Optimize meta descriptions',
          relevanceImpact: 6,
          clickImpact: 8,
          zeroClickImpact: 5,
          cost: '$0',
          time: '2 hours'
        },
        {
          action: 'Add location-specific content',
          relevanceImpact: 10,
          clickImpact: 7,
          zeroClickImpact: 12,
          cost: '$150',
          time: '3 hours'
        },
      ],
    },
    {
      id: 'review-optimization',
      name: 'Review Optimization',
      description: 'Improve review response and management',
      changes: [
        {
          action: 'Increase review response rate to 90%',
          relevanceImpact: 8,
          clickImpact: 6,
          zeroClickImpact: 10,
          cost: '$0',
          time: '1 hour'
        },
        {
          action: 'Add review schema markup',
          relevanceImpact: 5,
          clickImpact: 4,
          zeroClickImpact: 7,
          cost: '$0',
          time: '30 min'
        },
      ],
    },
    {
      id: 'competitive-advantage',
      name: 'Competitive Advantage',
      description: 'Beat your top competitors',
      changes: [
        {
          action: 'All schema optimizations',
          relevanceImpact: 20,
          clickImpact: 15,
          zeroClickImpact: 25,
          cost: '$0',
          time: '6 hours'
        },
        {
          action: 'Content depth enhancement',
          relevanceImpact: 18,
          clickImpact: 12,
          zeroClickImpact: 20,
          cost: '$350',
          time: '7 hours'
        },
        {
          action: 'Review management system',
          relevanceImpact: 10,
          clickImpact: 8,
          zeroClickImpact: 12,
          cost: '$0',
          time: '2 hours'
        },
      ],
    },
  ];

  const runSimulation = async () => {
    if (!selectedScenario) return;
    
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;

    // Simulate progressive impact
    let newRelevance = currentRelevance;
    let newClicks = 0;
    let newZeroClicks = 0;

    for (let i = 0; i < scenario.changes.length; i++) {
      const change = scenario.changes[i];
      
      // Animate progress
      for (let step = 0; step <= 100; step += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgress(((i * 100) + step) / scenario.changes.length);
      }

      // Apply change
      newRelevance = Math.min(100, newRelevance + change.relevanceImpact);
      newClicks += change.clickImpact;
      newZeroClicks += change.zeroClickImpact;

      setSimulatedRelevance(newRelevance);
      setSimulatedClicks(newClicks);
      setSimulatedZeroClicks(newZeroClicks);
    }

    // Calculate final results
    const totalCost = scenario.changes.reduce((sum, c) => {
      const cost = parseInt(c.cost.replace(/[^0-9]/g, '') || '0');
      return sum + cost;
    }, 0);

    const totalTime = scenario.changes.reduce((sum, c) => {
      const time = parseInt(c.time.replace(/[^0-9]/g, '') || '0');
      return sum + time;
    }, 0);

    const relevanceGain = newRelevance - currentRelevance;
    const estimatedMonthlyClicks = Math.round(newClicks * 30);
    const estimatedMonthlyZeroClicks = Math.round(newZeroClicks * 30);
    const estimatedRevenue = Math.round((estimatedMonthlyClicks + estimatedMonthlyZeroClicks) * 150); // $150 per lead

    const finalResults = {
      scenario: scenario.name,
      relevanceGain,
      newRelevance,
      estimatedMonthlyClicks,
      estimatedMonthlyZeroClicks,
      estimatedRevenue,
      totalCost,
      totalTime,
      changes: scenario.changes,
    };

    setResults(finalResults);
    setIsRunning(false);
    setProgress(100);

    if (onSimulationComplete) {
      onSimulationComplete(finalResults);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setProgress(0);
    setSimulatedRelevance(currentRelevance);
    setSimulatedClicks(0);
    setSimulatedZeroClicks(0);
    setResults(null);
  };

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            RI Simulator
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Test different optimization scenarios and see their impact
          </p>
        </div>
        <button
          onClick={resetSimulation}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Current State */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Current Relevance</div>
          <div className="text-3xl font-black text-white tabular-nums">{currentRelevance}</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Simulated Relevance</div>
          <div className={`text-3xl font-black tabular-nums ${
            simulatedRelevance > currentRelevance ? 'text-emerald-400' : 'text-white'
          }`}>
            {simulatedRelevance}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Gain</div>
          <div className={`text-3xl font-black tabular-nums ${
            simulatedRelevance > currentRelevance ? 'text-emerald-400' : 'text-gray-400'
          }`}>
            {simulatedRelevance > currentRelevance ? '+' : ''}
            {simulatedRelevance - currentRelevance}
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-300">Select Scenario</div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            {showTemplates ? 'Hide' : 'Show'} Templates
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {showTemplates && templates.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario.id);
                resetSimulation();
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === scenario.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-white mb-1">{scenario.name}</div>
              <div className="text-xs text-gray-400">{scenario.description}</div>
            </button>
          ))}
          {[...scenarios, ...customScenarios].map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario.id);
                resetSimulation();
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === scenario.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-white mb-1">{scenario.name}</div>
              <div className="text-xs text-gray-400">{scenario.description}</div>
            </button>
          ))}
          <button
            onClick={() => setShowCustomScenarioModal(true)}
            className="p-4 rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/30 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all text-center"
          >
            <div className="font-semibold text-white mb-1">+ Create Custom Scenario</div>
            <div className="text-xs text-gray-400">Build your own optimization plan</div>
          </button>
        </div>
      </div>

      {/* Custom Scenario Modal */}
      {showCustomScenarioModal && (
        <CustomScenarioModal
          domain={domain}
          dealerId={dealerId}
          currentRelevance={currentRelevance}
          onClose={() => setShowCustomScenarioModal(false)}
          onSave={() => {
            fetchCustomScenarios();
            setShowCustomScenarioModal(false);
          }}
        />
      )}

      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-6">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">
            Simulating scenario... {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={runSimulation}
        disabled={!selectedScenario || isRunning}
        className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mb-6"
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5" />
            Running Simulation...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Run Simulation
          </>
        )}
      </button>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div className="font-bold text-white">Simulation Complete</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Relevance Gain</div>
              <div className="text-2xl font-black text-emerald-400">+{results.relevanceGain}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">New Relevance</div>
              <div className="text-2xl font-black text-white">{results.newRelevance}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Est. Monthly Clicks</div>
              <div className="text-xl font-bold text-emerald-400">+{results.estimatedMonthlyClicks}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Est. Monthly Zero-Clicks</div>
              <div className="text-xl font-bold text-purple-400">+{results.estimatedMonthlyZeroClicks}</div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
            <div className="text-xs text-gray-400 mb-1">Estimated Monthly Revenue Impact</div>
            <div className="text-3xl font-black text-emerald-400">
              ${results.estimatedRevenue.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              <span className="font-semibold">Cost:</span> ${results.totalCost}
            </div>
            <div className="text-gray-400">
              <span className="font-semibold">Time:</span> {results.totalTime} hours
            </div>
            <div className="text-emerald-400 font-semibold">
              ROI: {results.totalCost > 0 ? Math.round((results.estimatedRevenue / results.totalCost) * 100) : '∞'}%
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="text-xs font-semibold text-gray-300 mb-2">Applied Changes</div>
            <div className="space-y-2">
              {results.changes.map((change: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-gray-800/50 rounded-lg p-2">
                  <span className="text-gray-300">{change.action}</span>
                  <span className="text-emerald-400 font-semibold">+{change.relevanceImpact}pts</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

