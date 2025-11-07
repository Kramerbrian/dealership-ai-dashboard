"use client";

/**
 * GPT Chat Interface Component
 * 
 * Interactive chat interface with GPT that supports function calling
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Car, Calendar, Search, DollarSign } from 'lucide-react';
import { createInteractionLog, saveInteractionLog } from '@/lib/gpt/feedback-schema';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  functionCalls?: Array<{ name: string; arguments: any }>;
  timestamp: Date;
}

export function GPTChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Generate interaction ID if first message
    const currentInteractionId = interactionId || `interaction-${Date.now()}`;
    if (!interactionId) {
      setInteractionId(currentInteractionId);
    }

    try {
      const response = await fetch('/api/gpt/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          interactionId: currentInteractionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        functionCalls: data.functionCalls,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Log interaction
      const log = createInteractionLog({
        interactionId: currentInteractionId,
        userQuery: input,
        botResponse: data.message,
        functionCalls: data.functionCalls || [],
        outcome: 'success'
      });
      await saveInteractionLog(log);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFunctionIcon = (functionName: string) => {
    const icons: Record<string, React.ReactNode> = {
      appraiseVehicle: <DollarSign className="w-4 h-4" />,
      scheduleTestDrive: <Calendar className="w-4 h-4" />,
      fetchInventory: <Search className="w-4 h-4" />,
      submitLead: <Car className="w-4 h-4" />
    };
    return icons[functionName] || <Car className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-semibold text-gray-900">Dealership AI Assistant</h2>
        <p className="text-sm text-gray-600">Ask about vehicles, appraisals, or schedule a test drive</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Start a conversation to get help with:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Vehicle appraisals</li>
              <li>• Inventory search</li>
              <li>• Test drive scheduling</li>
              <li>• Financing options</li>
            </ul>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.functionCalls && message.functionCalls.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="text-xs font-medium mb-1">Actions taken:</div>
                  {message.functionCalls.map((fc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {getFunctionIcon(fc.name)}
                      <span>{fc.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about vehicles, appraisals, or schedule a test drive..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

