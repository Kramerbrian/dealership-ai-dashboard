'use client';

import { useState } from 'react';
import { 
  AgentButton, 
  FloatingAgentButton, 
  AgentChatModal,
  EmergencyAgentTrigger,
  CompetitorAgentTrigger,
  AIVisibilityAgentTrigger
} from './index';

// Example: Integration into existing dashboard components
export function DashboardWithAgent() {
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const dealerDomain = 'terryreidhyundai.com';
  const dealerName = 'Terry Reid Hyundai';
  const currentScore = 67;
  const lostRevenue = 1200;
  const topCompetitor = 'Reed Dodge';

  return (
    <div className="space-y-6">
      {/* Example 1: Quick Actions Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EmergencyAgentTrigger 
            dealerDomain={dealerDomain} 
            lostRevenue={lostRevenue} 
          />
          <CompetitorAgentTrigger 
            dealerDomain={dealerDomain} 
            competitor={topCompetitor} 
          />
          <AIVisibilityAgentTrigger 
            dealerDomain={dealerDomain} 
            score={currentScore} 
          />
        </div>
      </div>

      {/* Example 2: Score Card with Agent Integration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Visibility Score</h3>
          <AgentButton
            dealerDomain={dealerDomain}
            context={{ type: 'ai_visibility', score: currentScore }}
            variant="secondary"
            size="sm"
          />
        </div>
        <div className="text-3xl font-bold text-blue-600 mb-2">{currentScore}/100</div>
        <div className="text-sm text-gray-600 mb-4">
          You're losing ${lostRevenue.toLocaleString()}/month to AI invisibility
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${currentScore}%` }}
          ></div>
        </div>
      </div>

      {/* Example 3: Issues List with Agent Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Critical Issues</h3>
          <button
            onClick={() => setIsAgentModalOpen(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ask AI About These
          </button>
        </div>
        <div className="space-y-3">
          {[
            { issue: 'Missing Schema Markup', impact: '$2,400/mo', severity: 'high' },
            { issue: 'Poor AI Visibility Score', impact: '$1,800/mo', severity: 'high' },
            { issue: 'Incomplete Google Business Profile', impact: '$1,200/mo', severity: 'medium' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{item.issue}</div>
                <div className="text-sm text-gray-600">{item.impact}</div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Example 4: Competitor Analysis with Agent */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Competitor Analysis</h3>
          <AgentButton
            dealerDomain={dealerDomain}
            context={{ type: 'competitor', competitor: topCompetitor }}
            variant="primary"
            size="sm"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Your Rank:</span>
            <span className="font-semibold">#3 of 12 dealers</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Gap to Leader:</span>
            <span className="font-semibold text-red-600">22 points</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Market Leader:</span>
            <span className="font-semibold">{topCompetitor}</span>
          </div>
        </div>
      </div>

      {/* Floating Agent Button */}
      <FloatingAgentButton
        dealerDomain={dealerDomain}
        context={{
          currentScore,
          topCompetitor,
          lostRevenue,
          currentIssues: ['Missing Schema', 'Poor AI Visibility']
        }}
      />

      {/* Agent Chat Modal */}
      <AgentChatModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        dealerDomain={dealerDomain}
        initialPrompt={`I have several critical issues affecting my AI visibility. Help me prioritize them and create an action plan.`}
      />
    </div>
  );
}

// Example: Integration into existing modal components
export function ModalWithAgentIntegration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dealerDomain = 'terryreidhyundai.com';

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Open Modal with Agent
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Dealership Analysis</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Your dealership analysis is complete. Here are the key findings:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Critical Issues Found</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Missing Schema Markup (High Impact)</li>
                  <li>• Incomplete Google Business Profile (Medium Impact)</li>
                  <li>• Low Review Response Rate (Medium Impact)</li>
                </ul>
              </div>

              {/* Agent Integration in Modal */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">🤖 Get AI-Powered Guidance</h4>
                    <p className="text-sm text-blue-600">
                      Ask our AI specialist about these issues and get personalized recommendations
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AgentButton
                      dealerDomain={dealerDomain}
                      context={{ type: 'emergency' }}
                      variant="primary"
                      size="sm"
                    />
                    <AgentButton
                      dealerDomain={dealerDomain}
                      context={{ type: 'custom' }}
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardWithAgent;
