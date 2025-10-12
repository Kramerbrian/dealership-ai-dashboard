'use client';

import { useState } from 'react';
import { Bot, X, MessageCircle, Zap, Target, TrendingUp } from 'lucide-react';
import AgentButton from './AgentButton';
import AgentChatModal from './AgentChatModal';

interface FloatingAgentButtonProps {
  dealerDomain: string;
  context?: {
    currentScore?: number;
    topCompetitor?: string;
    lostRevenue?: number;
    currentIssues?: string[];
  };
  className?: string;
}

export default function FloatingAgentButton({ 
  dealerDomain, 
  context = {},
  className = ''
}: FloatingAgentButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const quickActions = [
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'Quick Wins',
      prompt: `URGENT: ${dealerDomain} - I'm losing $${context.lostRevenue || 'thousands'}/mo. What are my top 3 quick wins?`,
      color: 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30'
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: 'AI Analysis',
      prompt: `Analyze ${dealerDomain} - why is my AI Visibility score only ${context.currentScore || 'low'}? What's the fastest fix?`,
      color: 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Competitor',
      prompt: `Compare ${dealerDomain} vs ${context.topCompetitor || 'top competitor'} - how do I close the gap?`,
      color: 'text-green-400 bg-green-500/20 hover:bg-green-500/30'
    }
  ];

  const openChat = (prompt?: string) => {
    setIsChatOpen(true);
    if (prompt) {
      // Store the prompt to be used when modal opens
      sessionStorage.setItem('agent-initial-prompt', prompt);
    }
  };

  const getInitialPrompt = () => {
    const stored = sessionStorage.getItem('agent-initial-prompt');
    if (stored) {
      sessionStorage.removeItem('agent-initial-prompt');
      return stored;
    }
    return undefined;
  };

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* Expanded Menu */}
        {isExpanded && (
          <div className="mb-4 space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => openChat(action.prompt)}
                className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg`}
                title={action.label}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group relative"
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
          
          {/* Pulse animation when not expanded */}
          {!isExpanded && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></div>
          )}
        </button>

        {/* Tooltip */}
        {!isExpanded && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Ask DealershipAI Agent
          </div>
        )}
      </div>

      {/* Agent Chat Modal */}
      <AgentChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        dealerDomain={dealerDomain}
        initialPrompt={getInitialPrompt()}
      />
    </>
  );
}

// Context-aware floating button variants
export function EmergencyFloatingButton({ dealerDomain, lostRevenue }: { dealerDomain: string; lostRevenue?: number }) {
  return (
    <FloatingAgentButton
      dealerDomain={dealerDomain}
      context={{ lostRevenue }}
      className="animate-pulse"
    />
  );
}

export function CompetitorFloatingButton({ dealerDomain, topCompetitor }: { dealerDomain: string; topCompetitor?: string }) {
  return (
    <FloatingAgentButton
      dealerDomain={dealerDomain}
      context={{ topCompetitor }}
    />
  );
}

export function AIVisibilityFloatingButton({ dealerDomain, currentScore }: { dealerDomain: string; currentScore?: number }) {
  return (
    <FloatingAgentButton
      dealerDomain={dealerDomain}
      context={{ currentScore }}
    />
  );
}
