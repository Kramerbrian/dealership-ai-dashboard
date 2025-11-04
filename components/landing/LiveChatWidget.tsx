'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Clock, Sparkles } from 'lucide-react';
import { ga } from '@/lib/ga';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface LiveChatWidgetProps {
  online?: boolean;
  quickResponses?: string[];
}

export function LiveChatWidget({ online = true, quickResponses }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hi! 👋 I\'m here to help. What would you like to know about DealershipAI?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scrollDepth, setScrollDepth] = useState(0);

  const defaultQuickResponses = [
    'How does it work?',
    'See pricing',
    'Schedule a demo',
    'What\'s included?'
  ];

  const displayQuickResponses = quickResponses || defaultQuickResponses;

  // Track scroll depth for smart suggestions
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollDepth(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show smart suggestions based on scroll depth
  useEffect(() => {
    if (!isOpen && scrollDepth > 50) {
      // Could show a notification here
    }
  }, [scrollDepth, isOpen]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (typeof window !== 'undefined' && window.gtag) {
      ga('chat_opened', { scroll_depth: scrollDepth });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined' && window.gtag) {
      ga('chat_closed');
    }
  };

  const handleQuickResponse = (response: string) => {
    setInputValue(response);
    handleSend(response);
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    if (typeof window !== 'undefined' && window.gtag) {
      ga('chat_message_sent', { message: messageText });
    }

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'Our pricing starts at $499/month for the Pro plan, with a 14-day free trial. We also offer a free tier! Would you like to see the full pricing breakdown?';
    }
    
    if (lowerMessage.includes('demo') || lowerMessage.includes('schedule')) {
      return 'I\'d be happy to schedule a demo! Would you prefer a quick 15-minute walkthrough or a more detailed 30-minute session?';
    }
    
    if (lowerMessage.includes('work') || lowerMessage.includes('how')) {
      return 'DealershipAI tracks your visibility across ChatGPT, Gemini, Perplexity, Google AI Overviews, and Copilot. We analyze your citations, trust signals, and provide actionable recommendations. Want to see how it works?';
    }
    
    if (lowerMessage.includes('features') || lowerMessage.includes('include')) {
      return 'Our Pro plan includes: Multi-platform AI monitoring, competitive intelligence, zero-click shield, automated fixes, revenue impact analysis, and priority support. Interested in learning more?';
    }

    return 'That\'s a great question! Let me connect you with our sales team who can provide more detailed information. Would you like to schedule a quick call?';
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 z-50 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          {online && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">DealershipAI Support</h3>
                <p className="text-xs text-white/80">
                  {online ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Online now
                    </span>
                  ) : (
                    'Usually replies in a few hours'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <div className="flex flex-wrap gap-2">
                {displayQuickResponses.map((response, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickResponse(response)}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              <Clock className="w-3 h-3 inline mr-1" />
              Average response time: 2 minutes
            </p>
          </div>
        </div>
      )}
    </>
  );
}

