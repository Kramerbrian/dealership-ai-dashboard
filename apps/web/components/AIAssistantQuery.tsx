/**
 * AI Assistant Query Component
 *
 * Context-aware AI assistant for DealershipAI dashboard
 * Provides intelligent insights based on metrics and user tier
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export interface AIAssistantContext {
  revenueAtRisk?: number;
  aiVisibility?: number;
  impressionsTrend?: any;
  criticalAlerts?: boolean;
  dealershipName?: string;
  overallScore?: number;
  competitorCount?: number;
  [key: string]: any;
}

export interface AIAssistantQueryProps {
  context: string;
  data: AIAssistantContext;
  theme?: 'light' | 'dark';
  placeholder?: string;
  onQuery?: (query: string) => string | Promise<string>;
  className?: string;
  maxHeight?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistantQuery({
  context,
  data,
  theme = 'dark',
  placeholder = 'Ask about your metrics...',
  onQuery,
  className = '',
  maxHeight = '400px'
}: AIAssistantQueryProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: getWelcomeMessage(data),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      let response: string;
      let requiresToolExecution = false;
      let toolCalls: any[] = [];

      if (onQuery) {
        // Use custom handler if provided
        response = await Promise.resolve(onQuery(userMessage.content));
      } else {
        // Build conversation history for OpenAI
        const updatedConversation = [
          ...conversationMessages,
          { role: 'user', content: userMessage.content }
        ];

        // Use built-in AI endpoint
        const res = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userMessage.content,
            context,
            data,
            messages: updatedConversation
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to get response');
        }

        const responseData = await res.json();
        response = responseData.response;
        requiresToolExecution = responseData.requiresToolExecution || false;
        toolCalls = responseData.toolCalls || [];

        // If tool execution is required, handle it
        if (requiresToolExecution && toolCalls.length > 0) {
          // Show "Fetching scores..." message
          const toolMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '🔍 Fetching fresh AI scores...',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, toolMessage]);

          // Execute each tool call
          for (const toolCall of toolCalls) {
            const toolRes = await fetch('/api/ai-assistant/execute-tool', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ toolCall })
            });

            if (toolRes.ok) {
              const toolData = await toolRes.json();
              const toolResult = toolData.result;

              // Add tool result to conversation
              updatedConversation.push({
                role: 'assistant',
                content: '',
                tool_calls: [toolCall]
              });
              updatedConversation.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: toolResult
              });

              // Get final response from AI with tool results
              const finalRes = await fetch('/api/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: 'Summarize the audit results',
                  context,
                  data,
                  messages: updatedConversation
                })
              });

              if (finalRes.ok) {
                const finalData = await finalRes.json();
                response = finalData.response;
              }
            }
          }

          // Update conversation state
          setConversationMessages(updatedConversation);
        } else {
          // Normal conversation flow
          setConversationMessages(updatedConversation);
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Assistant error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  }, [input, loading, onQuery, context, data, conversationMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const themeClasses = theme === 'dark'
    ? 'bg-gray-900 text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-300';

  const inputTheme = theme === 'dark'
    ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500'
    : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500';

  return (
    <div className={`flex flex-col rounded-lg border ${themeClasses} ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">AI Assistant</h3>
        <span className="ml-auto text-xs text-gray-400">
          Context: {context}
        </span>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-100'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg border ${inputTheme} focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50`}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Generate context-aware welcome message
 */
function getWelcomeMessage(data: AIAssistantContext): string {
  const messages = [
    `👋 Hello! I'm your AI visibility assistant.`,
  ];

  if (data.revenueAtRisk) {
    const risk = data.revenueAtRisk;
    if (risk > 300000) {
      messages.push(`⚠️ I notice you have $${(risk / 1000).toFixed(0)}K revenue at risk. Let's discuss optimization strategies.`);
    } else {
      messages.push(`You have $${(risk / 1000).toFixed(0)}K revenue at risk. I can help you reduce that.`);
    }
  }

  if (data.aiVisibility && data.aiVisibility < 60) {
    messages.push(`📊 Your AI visibility score of ${data.aiVisibility}% needs attention. Ask me how to improve it!`);
  }

  messages.push(`\nAsk me anything about your metrics, competitive positioning, or optimization strategies!`);

  return messages.join('\n');
}

/**
 * Quick action buttons for common queries
 */
export function AIQuickActions({
  onAction,
  theme = 'dark'
}: {
  onAction: (query: string) => void;
  theme?: 'light' | 'dark';
}) {
  const actions = [
    { label: 'Analyze Revenue Risk', query: 'What can I do about my revenue at risk?' },
    { label: 'Improve AI Visibility', query: 'How can I improve my AI visibility score?' },
    { label: 'Competitor Analysis', query: 'How do I compare to competitors?' },
    { label: 'Quick Wins', query: 'What are my top 3 quick wins?' },
  ];

  const buttonTheme = theme === 'dark'
    ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-900';

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.query)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${buttonTheme}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
