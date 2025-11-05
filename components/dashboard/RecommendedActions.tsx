'use client';

import { useState } from 'react';
import { Target, Clock, TrendingUp, Zap, AlertTriangle, ChevronRight, Lock } from 'lucide-react';

interface Action {
  id: string;
  type: 'alert' | 'strategic' | 'quick_win';
  title: string;
  description: string;
  competitive_context?: string;
  expected_impact: {
    aiv_gain: number;
    confidence: number;
  };
  time_required: string;
  difficulty: 'easy' | 'medium' | 'hard';
  locked: boolean; // Pro/Acceleration only
}

interface RecommendedActionsProps {
  actions: Action[];
  tier: 'free' | 'pro' | 'acceleration';
}

export function RecommendedActions({ actions, tier }: RecommendedActionsProps) {
  // Separate urgent alerts from strategic actions
  const urgentAlerts = actions.filter(a => a.type === 'alert');
  const strategicActions = actions.filter(a => a.type !== 'alert').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Urgent Alert Banner (only if exists) */}
      {urgentAlerts.length > 0 && (
        <UrgentAlertBanner alert={urgentAlerts[0]} tier={tier} />
      )}

      {/* Recommended Actions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                    dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recommended Actions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tier === 'free' 
                  ? 'Top 3 actions to improve your visibility (upgrade for detailed playbooks)'
                  : 'Your personalized action plan based on competitive intelligence'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {strategicActions.map((action, idx) => (
            <ActionCard 
              key={action.id} 
              action={action} 
              tier={tier}
              rank={idx + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Urgent Alert Banner
function UrgentAlertBanner({ alert, tier }: { alert: Action; tier: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 
                  dark:to-red-900/20 border-l-4 border-orange-500 dark:border-orange-600 
                  rounded-xl p-6 shadow-lg animate-in slide-in-from-top duration-500">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-2">
            {alert.title}
          </h3>
          <p className="text-orange-800 dark:text-orange-200 mb-4">
            {alert.description}
          </p>
          
          {alert.competitive_context && (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>What the data shows:</strong> {alert.competitive_context}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.location.href = `/strategies/${alert.id}`}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white 
                       rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {tier === 'free' ? 'Upgrade to Investigate' : 'Investigate Now'}
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setDismissed(true)}
              className="px-6 py-2 border border-orange-300 dark:border-orange-700 
                       text-orange-900 dark:text-orange-100 rounded-lg hover:bg-orange-100 
                       dark:hover:bg-orange-900/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Action Card
function ActionCard({ action, tier, rank }: { action: Action; tier: string; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  
  const canView = !action.locked || tier !== 'free';
  const canDeploy = tier === 'acceleration';

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
            ${rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              rank === 2 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
            {rank}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + Lock */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {action.title}
              {action.locked && tier === 'free' && (
                <Lock className="inline w-4 h-4 ml-2 text-gray-400" />
              )}
            </h3>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {action.description}
          </p>

          {/* Competitive Context (if exists) */}
          {action.competitive_context && canView && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 
                          dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Competitive Intel:</strong> {action.competitive_context}
              </p>
            </div>
          )}

          {/* Metrics */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                +{action.expected_impact.aiv_gain} AIV
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {action.time_required}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {action.expected_impact.confidence}% success rate
              </span>
            </div>

            <div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${action.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  action.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                {action.difficulty}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {canView ? (
              <>
                <button
                  onClick={() => window.location.href = `/strategies/${action.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                           rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  View Full Strategy
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {canDeploy && (
                  <button
                    onClick={() => deployStrategy(action.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white 
                             rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Deploy Now
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => window.location.href = '/upgrade'}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                         hover:from-blue-700 hover:to-purple-700 text-white rounded-lg 
                         font-medium transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Upgrade to Unlock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function deployStrategy(strategyId: string) {
  const confirmed = confirm('Deploy this strategy? You will receive implementation steps via email.');
  
  if (!confirmed) return;
  
  try {
    const response = await fetch('/api/strategies/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy_id: strategyId })
    });
    
    if (response.ok) {
      alert('✅ Strategy deployed! Check your email for next steps.');
    } else {
      alert('❌ Deployment failed. Please try again.');
    }
  } catch (error) {
    alert('❌ Network error. Please try again.');
  }
}
