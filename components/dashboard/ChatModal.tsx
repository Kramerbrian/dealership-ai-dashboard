'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Zap } from 'lucide-react';
import { ModalErrorBoundary } from '@/components/modals/ModalErrorBoundary';

interface ChatModalProps {
  tier: 'free' | 'pro' | 'acceleration';
  questionsToday: number;
  maxQuestions: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ label: string; strategy_id: string }>;
}

function ChatModalContent({ tier, questionsToday, maxQuestions }: ChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey! I'm your dAI assistant. I can help you understand your metrics, explain competitive moves, and ${
        tier === 'acceleration' ? 'deploy strategies' : 
        tier === 'pro' ? 'create detailed playbooks' : 
        'answer questions about your dashboard'
      }. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const questionsRemaining = maxQuestions - questionsToday;
  const canAsk = questionsRemaining > 0 || tier !== 'free';

  async function handleSend() {
    if (!input.trim() || !canAsk) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, tier })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        actions: data.actions // Strategy deployment buttons
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: { label: string; strategy_id: string }) {
    // Deploy strategy
    const response = await fetch('/api/strategies/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy_id: action.strategy_id })
    });
    
    if (response.ok) {
      alert('Strategy deployed! Check your email for implementation steps.');
    } else {
      alert('Failed to deploy strategy. Please try again.');
    }
  }

  return (
    <>
      {/* Chat Bubble (Bottom Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 
                 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 
                 flex items-center justify-center z-40 group"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {!canAsk && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                            flex items-center justify-center text-white text-xs font-bold">
                !
              </div>
            )}
          </>
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 
                      rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 
                      flex flex-col z-40 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">dAI Assistant</h3>
                  <p className="text-xs text-white/80">
                    {tier === 'free' 
                      ? `${questionsRemaining} questions left today`
                      : 'Unlimited questions'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  
                  {/* Action Buttons (for strategy deployment) */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleAction(action)}
                          disabled={tier !== 'acceleration'}
                          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 
                                   text-white text-sm rounded-lg disabled:bg-gray-400 
                                   disabled:cursor-not-allowed transition-colors"
                        >
                          {action.label}
                          {tier !== 'acceleration' && ' (Acceleration tier only)'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!canAsk ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  You've used all {maxQuestions} free questions today
                </p>
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  className="text-sm text-blue-600 dark:text-blue-400 font-semibold"
                >
                  Upgrade to Pro for unlimited →
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                           disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function ChatModal(props: ChatModalProps) {
  return (
    <ModalErrorBoundary modalName="Chat Modal" onClose={() => {}}>
      <ChatModalContent {...props} />
    </ModalErrorBoundary>
  );
}

