// @ts-nocheck
/**
 * AI Chat Widget Component
 * In-app AI assistant with context-aware responses
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, X, Send, Sparkles, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

export interface ChatAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

export interface ChatContext {
  dealership?: {
    name: string;
    id: string;
    aiScore: number;
    location: string;
  };
  currentPage?: string;
  recentActivity?: string[];
}

interface AIChatWidgetProps {
  context?: ChatContext;
  onAction?: (action: string) => void;
  minimized?: boolean;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  context,
  onAction,
  minimized: initialMinimized = true
}) => {
  const [minimized, setMinimized] = useState(initialMinimized);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hey! I can help with AI visibility questions, competitor analysis, or specific fixes. What are you working on?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (!minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [minimized]);

  // Smart suggestions based on context
  const suggestions = [
    context?.dealership?.aiScore && context.dealership.aiScore < 50 && 'What are my 3 quickest wins?',
    context?.currentPage === '/competitor' && 'Show me my biggest competitor weakness',
    context?.currentPage === '/dashboard' && 'How can I improve my AI score?',
    'How do I rank against competitors?',
    'What schema issues do I have?',
    'Show me my review optimization opportunities'
  ].filter(Boolean);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate API call
      const response = await generateAIResponse(input, context, messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
        >
          <Brain size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={20} />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="text-white/80 hover:text-white transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.actions && (
                <div className="mt-2 space-x-2">
                  {message.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => {
                        action.action();
                        onAction?.(action.label);
                      }}
                      className={`text-xs px-3 py-1 rounded transition ${
                        action.type === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="text-xs text-gray-500 mb-2">Quick actions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestion(suggestion!)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Generate AI response based on context
 */
async function generateAIResponse(
  query: string,
  context?: ChatContext,
  history?: ChatMessage[]
): Promise<{ content: string; actions?: ChatAction[] }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const queryLower = query.toLowerCase();

  // Context-aware responses
  if (queryLower.includes('quick wins') || queryLower.includes('quickest')) {
    return {
      content: `Based on your current AI score of ${context?.dealership?.aiScore || 75}, here are your top 3 quick wins:

1. **Fix Schema Markup** (2 hours, +15 points)
   - Add Vehicle schema to your inventory pages
   - Implement LocalBusiness schema on homepage

2. **Optimize Google Business Profile** (1 hour, +12 points)
   - Add more photos and posts
   - Respond to recent reviews

3. **Improve Page Speed** (3 hours, +8 points)
   - Compress images
   - Enable browser caching

Would you like me to show you exactly how to implement any of these?`,
      actions: [
        {
          label: 'Show Schema Guide',
          action: () => console.log('Open schema guide'),
          type: 'primary'
        },
        {
          label: 'View GMB Tips',
          action: () => console.log('Open GMB tips'),
          type: 'secondary'
        }
      ]
    };
  }

  if (queryLower.includes('competitor') || queryLower.includes('compare')) {
    return {
      content: `I can help you analyze your competitors! Here's what I found:

**Your Top Competitors:**
- Competitor A: 92.1 AI Score (5 points ahead)
- Competitor B: 78.5 AI Score (8.8 points behind you)
- Competitor C: 85.2 AI Score (2.1 points behind you)

**Key Insights:**
- Competitor A has stronger schema implementation
- You're beating Competitor B in review quality
- Competitor C is gaining ground with recent content updates

Would you like me to show you their exact strategies?`,
      actions: [
        {
          label: 'View Competitor Analysis',
          action: () => console.log('Open competitor analysis'),
          type: 'primary'
        },
        {
          label: 'Get Alerts',
          action: () => console.log('Set up competitor alerts'),
          type: 'secondary'
        }
      ]
    };
  }

  if (queryLower.includes('schema')) {
    return {
      content: `Your schema audit shows several opportunities:

**Critical Issues:**
- Missing Vehicle schema on 23 inventory pages
- Incomplete LocalBusiness markup
- No Review schema on testimonials

**Quick Fixes:**
1. Add Vehicle schema to all inventory pages
2. Complete LocalBusiness schema with all required fields
3. Implement Review schema for customer testimonials

This could boost your AI visibility by 15-20 points!`,
      actions: [
        {
          label: 'Fix Schema Now',
          action: () => console.log('Open schema fixer'),
          type: 'primary'
        },
        {
          label: 'Learn More',
          action: () => console.log('Open schema guide'),
          type: 'secondary'
        }
      ]
    };
  }

  if (queryLower.includes('score') || queryLower.includes('improve')) {
    return {
      content: `Your current AI visibility score is ${context?.dealership?.aiScore || 75}/100.

**To reach 90+ score:**
1. **Schema Optimization** (+15 points)
2. **Review Management** (+10 points)  
3. **Content Quality** (+8 points)
4. **Technical SEO** (+5 points)

**Priority Actions:**
- Fix schema markup (highest impact)
- Respond to recent reviews
- Create location-specific content
- Optimize page loading speed

Would you like me to create a personalized action plan?`,
      actions: [
        {
          label: 'Create Action Plan',
          action: () => console.log('Create action plan'),
          type: 'primary'
        },
        {
          label: 'View Detailed Analysis',
          action: () => console.log('Open detailed analysis'),
          type: 'secondary'
        }
      ]
    };
  }

  // Default response
  return {
    content: `I can help you with:

• **AI Visibility Optimization** - Boost your score across all AI platforms
• **Competitor Analysis** - See how you stack up against rivals  
• **Quick Wins** - Easy fixes with big impact
• **Schema Issues** - Technical SEO improvements
• **Review Management** - Optimize your online reputation

What specific area would you like to focus on?`,
    actions: [
      {
        label: 'Show Quick Wins',
        action: () => console.log('Show quick wins'),
        type: 'primary'
      },
      {
        label: 'Analyze Competitors',
        action: () => console.log('Analyze competitors'),
        type: 'secondary'
      }
    ]
  };
}

/**
 * Hook for using chat widget
 */
export const useChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return { isOpen, open, close, toggle };
};

export default AIChatWidget;