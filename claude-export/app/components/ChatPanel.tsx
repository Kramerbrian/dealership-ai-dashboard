'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  tenantId: string;
}

export default function ChatPanel({ tenantId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hey there! I'm your AI assistant. Ask me about your AI Visibility Index, marketing trends, or mystery shop results. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('ai visibility') || lowerInput.includes('aiv')) {
      return "Your AI Visibility Index is currently at 78.3% - that's solid! You're ranking well across ChatGPT, Gemini, and Perplexity. The main opportunity I see is boosting your FAQ schema markup. Want me to show you exactly which pages need work?";
    }
    
    if (lowerInput.includes('marketing') || lowerInput.includes('trend')) {
      return "Marketing trends are looking spicy! Your digital presence is up 12% this month, but your competitors are getting aggressive with local SEO. I'd recommend doubling down on your Google Business Profile optimization - there's about $15K in monthly revenue sitting on the table there.";
    }
    
    if (lowerInput.includes('mystery') || lowerInput.includes('shop')) {
      return "Mystery shop results just came in hot! Your phone response time is crushing it at 2.3 minutes average, but your email follow-up could use some love. Only 67% of leads get a response within 24 hours. Want me to draft some templates that'll get you to 90%+?";
    }
    
    if (lowerInput.includes('symmetry') || lowerInput.includes('mode')) {
      return "🔄 Symmetry Mode activated! Your digital presence is now perfectly balanced across all channels. It's like having a perfectly aligned car - everything just works better. Your AI Visibility Index just jumped 3.2 points. You're welcome!";
    }
    
    if (lowerInput.includes('time dilation') || lowerInput.includes('dilation')) {
      return "⏰ Time Dilation engaged! I've compressed your response times by 40% while expanding your market reach by 60%. Your competitors are now moving in slow motion while you're operating at light speed. Physics is fun when you're winning!";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return "I'm your AI assistant for DealershipAI! I can help you with:\n\n• AI Visibility Index analysis and improvements\n• Marketing trend insights and competitive analysis\n• Mystery shop results and lead response optimization\n• Quick actions like Symmetry Mode and Time Dilation\n\nJust ask me anything about your dealership's digital performance!";
    }
    
    // Default witty responses
    const defaultResponses = [
      "That's a great question! Let me crunch some numbers and get back to you with some actionable insights.",
      "I love the way you think! Your AI Visibility Index is responding well to that kind of strategic thinking.",
      "Now we're talking! That's exactly the kind of question that separates the winners from the also-rans in this game.",
      "Boom! That's the kind of insight that makes me excited to be your AI assistant. Let me dig into the data for you.",
      "You're asking all the right questions! This is why your dealership is going to dominate the digital landscape."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const quickActions = [
    { name: 'Symmetry Mode', action: 'Activate Symmetry Mode' },
    { name: 'Time Dilation', action: 'Engage Time Dilation' },
    { name: 'AI Visibility', action: 'Show me my AI Visibility Index' },
    { name: 'Marketing Trends', action: 'What are the latest marketing trends?' }
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Your digital performance expert</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleQuickAction(action.action)}
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50"
            >
              {action.name}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me about your AI Visibility, marketing trends, or mystery shop results..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
