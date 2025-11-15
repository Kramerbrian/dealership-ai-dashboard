'use client';

/**
 * HAL Chat Component
 * Conversational interface powered by Orchestrator 3.0
 * Replaces traditional dashboard with agentic intelligence
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { callOrchestrator, type OrchestratorRequest } from '@/lib/orchestrator/gpt-bridge';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  traceId?: string;
}

interface HALChatProps {
  dealerId: string;
  domain?: string;
  className?: string;
}

export default function HALChat({ dealerId, domain, className = '' }: HALChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello. I am HAL, your AI Chief Strategy Officer. I can analyze visibility, compute QAI, calculate OCI, generate ASRs, and analyze UGC. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Parse intent and route to orchestrator
      const action = parseIntent(input);
      const request: OrchestratorRequest = {
        action,
        dealerId,
        domain,
        context: {
          previousMessages: messages.slice(-3).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      };

      const response = await callOrchestrator(request);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatResponse(response, input),
        timestamp: new Date(),
        confidence: response.confidence,
        traceId: response.traceId
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const parseIntent = (input: string): OrchestratorRequest['action'] => {
    const lower = input.toLowerCase();
    
    if (lower.includes('visibility') || lower.includes('visible') || lower.includes('aiv')) {
      return 'analyze_visibility';
    }
    if (lower.includes('qai') || lower.includes('quality authority') || lower.includes('trust index')) {
      return 'compute_qai';
    }
    if (lower.includes('oci') || lower.includes('opportunity cost') || lower.includes('revenue at risk')) {
      return 'calculate_oci';
    }
    if (lower.includes('asr') || lower.includes('recommend') || lower.includes('action') || lower.includes('fix')) {
      return 'generate_asr';
    }
    if (lower.includes('ugc') || lower.includes('review') || lower.includes('sentiment')) {
      return 'analyze_ugc';
    }
    
    // Default to ASR generation for general queries
    return 'generate_asr';
  };

  const formatResponse = (response: any, originalQuery: string): string => {
    if (!response.success) {
      return `I couldn't process that request: ${response.error || 'Unknown error'}`;
    }

    const { result, confidence, rationale } = response;
    
    // Format based on action type
    if ((result as any).aiv !== undefined) {
      return `**AI Visibility Analysis**\n\n- AI Visibility Index (AIV): ${(result as any).aiv}\n- Algorithmic Trust Index (ATI): ${(result as any).ati || 'N/A'}\n\nPlatform Breakdown:\n${(result as any).platforms ? Object.entries((result as any).platforms).map(([p, s]: [string, any]) => `  • ${p}: ${s}`).join('\n') : 'N/A'}\n\nConfidence: ${(confidence! * 100).toFixed(1)}%`;
    }
    
    if ((result as any).qai !== undefined) {
      return `**Quality Authority Index**\n\n- Overall QAI: ${(result as any).qai}\n\nComponents:\n${(result as any).components ? Object.entries((result as any).components).map(([c, v]: [string, any]) => `  • ${c}: ${v}`).join('\n') : 'N/A'}\n\nConfidence: ${(confidence! * 100).toFixed(1)}%`;
    }
    
    if ((result as any).ociValue !== undefined) {
      return `**Opportunity Cost of Inaction**\n\n- Monthly OCI Value: $${(result as any).ociValue.toLocaleString()}\n- Monthly Risk: $${(result as any).monthlyRisk?.toLocaleString() || 'N/A'}\n- Recoverable: $${(result as any).recoverable?.toLocaleString() || 'N/A'}\n\nConfidence: ${(confidence! * 100).toFixed(1)}%`;
    }
    
    if ((result as any).recommendations) {
      return `**Autonomous Strategy Recommendations**\n\n${(result as any).recommendations.map((rec: any, idx: number) => 
        `${idx + 1}. **${rec.action}**\n   - Impact: $${rec.impact?.toLocaleString() || 'N/A'}/mo\n   - Effort: ${rec.effort || 'N/A'}\n   - Confidence: ${(rec.confidence * 100).toFixed(1)}%`
      ).join('\n\n')}\n\nOverall Confidence: ${((result as any).overallConfidence * 100).toFixed(1)}%`;
    }
    
    if ((result as any).sentiment !== undefined) {
      return `**UGC Sentiment Analysis**\n\n- Overall Sentiment: ${(result as any).sentiment}\n\nPlatform Breakdown:\n${(result as any).platforms ? Object.entries((result as any).platforms).map(([p, s]: [string, any]) => `  • ${p}: ${s}`).join('\n') : 'N/A'}\n\nRecommendations:\n${(result as any).recommendations ? (result as any).recommendations.map((r: string) => `  • ${r}`).join('\n') : 'N/A'}\n\nConfidence: ${(confidence! * 100).toFixed(1)}%`;
    }

    // Fallback
    return rationale || JSON.stringify(result, null, 2);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="relative">
          <Bot className="w-6 h-6 text-blue-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">HAL — AI Chief Strategy Officer</h3>
          <p className="text-xs text-slate-400">Powered by Orchestrator 3.0</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4" />
          <span>CognitiveOps</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-blue-600' 
                : 'bg-gradient-to-br from-blue-600 to-purple-600'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-200'
              }`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                {message.confidence && (
                  <div className="mt-2 text-xs opacity-75">
                    Confidence: {(message.confidence * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-slate-800 text-slate-200 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask HAL about visibility, QAI, OCI, ASRs, or UGC..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white 
                       placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Try: "What's my AI visibility?" • "Calculate OCI" • "Generate ASRs" • "Analyze UGC sentiment"
        </div>
      </div>
    </div>
  );
}

