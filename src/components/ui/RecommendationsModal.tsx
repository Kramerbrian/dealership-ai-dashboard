'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import AgentButton, { EmergencyAgentTrigger, AIVisibilityAgentTrigger } from '../agent/AgentButton';
import AgentChatModal from '../agent/AgentChatModal';

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: number;
  impact_score: number;
  effort_level: number;
  estimated_improvement: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: Recommendation[];
  dealerName: string;
  dealerDomain?: string;
}

const getPriorityColor = (priority: number) => {
  if (priority <= 2) return 'text-red-400 bg-red-500/20 border-red-500/30';
  if (priority <= 3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'ai_visibility':
      return '🤖';
    case 'technical_seo':
      return '⚙️';
    case 'content':
      return '📝';
    case 'reputation':
      return '⭐';
    case 'local_seo':
      return '📍';
    case 'monitoring':
      return '📊';
    default:
      return '💡';
  }
};

const getEffortLabel = (effort: number) => {
  if (effort <= 3) return 'Low Effort';
  if (effort <= 6) return 'Medium Effort';
  return 'High Effort';
};

const getImpactLabel = (impact: number) => {
  if (impact <= 4) return 'Low Impact';
  if (impact <= 7) return 'Medium Impact';
  return 'High Impact';
};

export default function RecommendationsModal({ isOpen, onClose, recommendations, dealerName, dealerDomain }: RecommendationsModalProps) {
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const sortedRecommendations = [...recommendations].sort((a, b) => a.priority - b.priority);
  
  // Calculate total potential impact for agent context
  const totalImpact = recommendations.reduce((sum, rec) => {
    const impactValue = rec.impact_score * 100; // Convert to dollar estimate
    return sum + impactValue;
  }, 0);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-900/95 backdrop-blur-md border border-gray-800/50 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">💡</span>
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                        AI Recommendations for {dealerName}
                      </Dialog.Title>
                      <p className="text-sm text-gray-400 mt-1">
                        {recommendations.length} personalized recommendations to improve your AI visibility
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Recommendations List */}
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                  {sortedRecommendations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h4 className="text-lg font-medium text-white mb-2">No Recommendations Yet</h4>
                      <p className="text-gray-400">
                        Run an audit to generate personalized recommendations for your dealership.
                      </p>
                    </div>
                  ) : (
                    sortedRecommendations.map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          {/* Category Icon */}
                          <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{getCategoryIcon(rec.category)}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                                Priority {rec.priority}
                              </span>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                              {rec.description}
                            </p>

                            {/* Metrics */}
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Impact:</span>
                                <span className={`font-medium ${
                                  rec.impact_score >= 7 ? 'text-green-400' : 
                                  rec.impact_score >= 4 ? 'text-yellow-400' : 'text-gray-400'
                                }`}>
                                  {getImpactLabel(rec.impact_score)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Effort:</span>
                                <span className={`font-medium ${
                                  rec.effort_level <= 3 ? 'text-green-400' : 
                                  rec.effort_level <= 6 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {getEffortLabel(rec.effort_level)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Expected:</span>
                                <span className="text-blue-400 font-medium">{rec.estimated_improvement}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex-shrink-0">
                            <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/30 transition-colors">
                              Get Started
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {recommendations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-800/50">
                    {/* Agent Integration */}
                    {dealerDomain && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">🤖 Get AI-Powered Analysis</h4>
                            <p className="text-xs text-gray-400">
                              Ask our AI specialist about these recommendations and get personalized guidance
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsAgentModalOpen(true)}
                              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                            >
                              <span>💬</span>
                              Chat with AI
                            </button>
                            <EmergencyAgentTrigger 
                              dealerDomain={dealerDomain} 
                              lostRevenue={Math.round(totalImpact)} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        💡 Focus on high-impact, low-effort recommendations first for maximum ROI
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={onClose}
                          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement export functionality
                            console.log('Export recommendations');
                          }}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium rounded-lg border border-blue-500/30 transition-colors"
                        >
                          Export List
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      
      {/* Agent Chat Modal */}
      {dealerDomain && (
        <AgentChatModal
          isOpen={isAgentModalOpen}
          onClose={() => setIsAgentModalOpen(false)}
          dealerDomain={dealerDomain}
          initialPrompt={`I have ${recommendations.length} recommendations for ${dealerName}. Help me prioritize them and create an action plan.`}
        />
      )}
    </Transition>
  );
}
