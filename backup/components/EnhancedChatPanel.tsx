/**
 * Enhanced Chat Panel with Nolan-Inspired Responses
 * Christopher Nolan and Matrix references for sophisticated AI interactions
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Brain, 
  Zap, 
  Target,
  Clock,
  TrendingUp,
  Eye,
  Shield
} from 'lucide-react';

const cannedResponses: Record<string, string> = {
  'symmetry': "🎯 **Symmetry Mode Activated!** Your QAI scores are beautifully balanced across all channels—like spinning totems aligning in *Inception*. Even Pythagoras would be jealous!",
  'time-dilation': "⏰ **Time Dilation Engaged!** Your marketing campaigns are warping time like *Interstellar*—while your competitors are stuck on Earth, you're out near a black hole making time work for you.",
  'trending': "📈 **Trend Analysis Complete!** Your AI Visibility Index is trending upward faster than the van falling in *Inception's* zero‑gravity hallway. The data shows you're not just keeping up—you're bending reality in the digital race!",
  'ai-visibility': "🤖 **AI Visibility Report:** Your dealership is showing up in AI responses 23% more than last month. You're basically the Neo of automotive AI—enigmatic, unstoppable, and bending reality to your will."
};

const chatActions = [
  { id: 'symmetry', label: 'Symmetry Analysis', icon: <Target className="w-4 h-4" /> },
  { id: 'time-dilation', label: 'Time Dilation', icon: <Clock className="w-4 h-4" /> },
  { id: 'trending', label: 'Trend Analysis', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'ai-visibility', label: 'AI Visibility', icon: <Eye className="w-4 h-4" /> }
];

export default function EnhancedChatPanel() {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean; timestamp: Date }>>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = {
      id: (Date.now() + 1).toString(),
      text: "I've analyzed your request through multiple layers of reality. The data suggests your AI visibility is operating in bullet time—faster than Neo dodging bullets while maintaining the elegance of a Christopher Nolan plot twist.",
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleCannedResponse = (actionId: string) => {
    const response = cannedResponses[actionId];
    if (response) {
      const aiMessage = {
        id: Date.now().toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 h-[600px] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Assistant</h3>
          <p className="text-sm text-gray-600">Powered by Nolan-inspired intelligence</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.text}</div>
              <div className={`text-xs mt-2 ${
                message.isUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking in bullet time...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          {chatActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleCannedResponse(action.id)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          placeholder="Ask me anything about your AI visibility..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isTyping}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
}
