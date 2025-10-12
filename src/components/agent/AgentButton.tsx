'use client';

import { useState } from 'react';
import { Bot, Zap, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface AgentButtonProps {
  dealerDomain: string;
  context?: {
    type?: 'ai_visibility' | 'emergency' | 'competitor' | 'custom';
    score?: number;
    lostRevenue?: number;
    competitor?: string;
    currentIssues?: string[];
  };
  className?: string;
  variant?: 'primary' | 'secondary' | 'floating';
  size?: 'sm' | 'md' | 'lg';
}

const SUGGESTED_PROMPTS = {
  ai_visibility: (domain: string, score?: number) => 
    `Analyze ${domain} - why is my AI Visibility score only ${score || 'low'}? What's the fastest fix?`,
  
  emergency: (domain: string, lostRevenue?: number) => 
    `URGENT: ${domain} - I'm losing $${lostRevenue || 'thousands'}/mo. What are my top 3 quick wins?`,
  
  competitor: (domain: string, competitor?: string) => 
    `Compare ${domain} vs ${competitor || 'top competitor'} - how do I close the gap?`,
  
  custom: (domain: string) => 
    `Analyze ${domain} for AI search optimization`
};

export default function AgentButton({ 
  dealerDomain, 
  context = {}, 
  className = '',
  variant = 'primary',
  size = 'md'
}: AgentButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getPrompt = () => {
    const promptType = context.type || 'custom';
    return SUGGESTED_PROMPTS[promptType](dealerDomain, context.score, context.lostRevenue, context.competitor);
  };

  const openAgent = (prompt?: string) => {
    const finalPrompt = prompt || getPrompt();
    
    // Option A: Direct link to ChatGPT with pre-filled prompt
    const gptUrl = `https://chat.openai.com/g/g-[YOUR_GPT_ID]?q=${encodeURIComponent(finalPrompt)}`;
    window.open(gptUrl, '_blank');
    
    // Option B: In-app modal (premium version)
    // showAgentModal(finalPrompt);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300';
      case 'floating':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-3xl rounded-full';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIcon = () => {
    switch (context.type) {
      case 'emergency':
        return <AlertCircle className="w-4 h-4" />;
      case 'competitor':
        return <TrendingUp className="w-4 h-4" />;
      case 'ai_visibility':
        return <Target className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => openAgent()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`${getVariantStyles()} ${getSizeStyles()} transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group`}
        >
          {getIcon()}
          <span className="font-medium">Ask DealershipAI Agent</span>
          {isHovered && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Get AI-powered analysis
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`agent-triggers ${className}`}>
      <button
        onClick={() => openAgent()}
        className={`${getVariantStyles()} ${getSizeStyles()} rounded-lg font-medium transition-all duration-200 flex items-center gap-2 group`}
      >
        {getIcon()}
        <span>🤖 Ask DealershipAI Agent</span>
      </button>
      
      {/* Suggested prompts for context-aware actions */}
      {context.type && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(SUGGESTED_PROMPTS).map(([key, promptFn]) => (
            <button
              key={key}
              onClick={() => openAgent(promptFn(dealerDomain, context.score, context.lostRevenue, context.competitor))}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            >
              {key === 'emergency' && '💰 Quick wins'}
              {key === 'competitor' && '⚔️ Compare'}
              {key === 'ai_visibility' && '🎯 AI Analysis'}
              {key === 'custom' && '🔍 Full analysis'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Context-aware agent triggers for different dashboard sections
export function EmergencyAgentTrigger({ dealerDomain, lostRevenue }: { dealerDomain: string; lostRevenue?: number }) {
  return (
    <AgentButton
      dealerDomain={dealerDomain}
      context={{ type: 'emergency', lostRevenue }}
      variant="primary"
      className="w-full"
    />
  );
}

export function CompetitorAgentTrigger({ dealerDomain, competitor }: { dealerDomain: string; competitor?: string }) {
  return (
    <AgentButton
      dealerDomain={dealerDomain}
      context={{ type: 'competitor', competitor }}
      variant="secondary"
      className="w-full"
    />
  );
}

export function AIVisibilityAgentTrigger({ dealerDomain, score }: { dealerDomain: string; score?: number }) {
  return (
    <AgentButton
      dealerDomain={dealerDomain}
      context={{ type: 'ai_visibility', score }}
      variant="primary"
      className="w-full"
    />
  );
}
