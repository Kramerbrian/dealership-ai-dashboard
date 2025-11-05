'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HAL9000ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const HAL9000Chatbot: React.FC<HAL9000ChatbotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm HAL-9000, your AI cognitive assistant. I can help you analyze dealership performance, identify opportunities, and provide strategic insights. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const response = await generateResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async (userInput: string): Promise<string> => {
    const lowerInput = userInput.toLowerCase();
    
    // Pattern matching for common queries
    if (lowerInput.includes('sales') || lowerInput.includes('conversion')) {
      return "Based on your current sales data, I can see your conversion rate is 18.2%, which is above industry average. However, I've identified that improving lead response time from 4.2 hours to under 2 hours could increase monthly revenue by $45K. Would you like me to show you the dAI Cognitive Dashboard with detailed insights?";
    }
    
    if (lowerInput.includes('f&i') || lowerInput.includes('finance')) {
      return "Your F&I penetration is currently 68%. Top performers achieve 85%+. I can help you identify specific strategies to increase F&I revenue by $52K/month. Check the New Car Manager section in the Cognitive Dashboard for detailed action items.";
    }
    
    if (lowerInput.includes('service') || lowerInput.includes('service revenue')) {
      return "Your service department shows strong customer retention at 72%. However, increasing revenue per R.O. from $342 to $425 could add $32K/month in service revenue. I recommend reviewing the Service Director section in the Cognitive Dashboard.";
    }
    
    if (lowerInput.includes('opportunity') || lowerInput.includes('improve') || lowerInput.includes('optimize')) {
      return "I've identified several high-ROI opportunities across your dealership. The highest impact areas are:\n1. Lead Response Time - $45K/month opportunity\n2. F&I Penetration - $52K/month opportunity\n3. Website Conversion - $42K/month opportunity\n\nWould you like me to open the Cognitive Dashboard to explore these in detail?";
    }
    
    if (lowerInput.includes('dashboard') || lowerInput.includes('cognitive')) {
      return "The dAI Cognitive Dashboard provides executive insights organized by department manager. Each section includes recognition KPIs and opportunity KPIs with ROI analysis. You can access it from the main dashboard. Would you like me to help you navigate to a specific department?";
    }
    
    if (lowerInput.includes('piqr') || lowerInput.includes('quality reliability') || lowerInput.includes('ai reliability')) {
      return "PIQR (Perceptual Intelligence & Quality Reliability) is a composite score measuring AI reliability across trust, clarity, and consensus. Your current PIQR score reflects:\n• AI Visibility Index (AIV) - how well AI platforms find your content\n• Algorithmic Trust Index (ATI) - schema consistency and review legitimacy\n• Composite Reputation Score (CRS) - variance-weighted reputation\n• Consensus Reliability - agreement across ChatGPT, Gemini, and Perplexity\n\nYou can view detailed PIQR metrics in the AI Health tab. Would you like me to help you improve your PIQR score?";
    }
    
    if (lowerInput.includes('aiv') || lowerInput.includes('visibility index') || lowerInput.includes('what is my visibility') || lowerInput.includes('show my ai score') || lowerInput.includes('how visible am i')) {
      // Fetch AIV data for the response
      try {
        const dealerId = 'default-dealer'; // In production, get from auth context
        const response = await fetch(`/api/aiv/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dealerId }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.data?.chat_summary) {
            return data.data.chat_summary;
          }
        }
      } catch (e) {
        console.error('Error fetching AIV data:', e);
      }
      
      return "Your AIV™ (Algorithmic Visibility Index) measures how well AI platforms like ChatGPT, Gemini, Claude, and Perplexity can find and understand your dealership content. AIVR™ (AI Visibility ROI) factors in conversion lift from your A/B tests. I can show you your current scores and revenue at risk. Would you like me to open the AIV modal for detailed insights?";
    }
    
    if (lowerInput.includes('consensus') || lowerInput.includes('ai agreement')) {
      return "AI Consensus measures how consistently different AI platforms (ChatGPT, Gemini, Perplexity) interpret your content. A high consensus score indicates your content is clear and unambiguous. I can help you run a consensus check to see how your content performs across AI platforms. This is available in the AI Health tab.";
    }
    
    if (lowerInput.includes('recheck') || lowerInput.includes('re-analyze') || lowerInput.includes('refresh')) {
      return "I can trigger a re-analysis of your PIQR metrics. This will:\n• Re-check AI consensus across platforms\n• Update semantic clarity scores\n• Refresh forecast data\n• Recalculate variance weights\n\nWould you like me to start a full PIQR recheck? This typically takes 2-3 minutes.";
    }
    
    if (lowerInput.includes('diagnose') || lowerInput.includes('what\'s wrong') || lowerInput.includes('issues')) {
      return "I can run a diagnostic check on your PIQR metrics to identify:\n• Low consensus reliability (AI platforms disagree)\n• Semantic clarity issues (RankEmbed scores)\n• Schema inconsistencies\n• Review legitimacy concerns\n• Variance spikes in AIV/ATI\n\nWould you like me to run a diagnostic now?";
    }
    
    if (lowerInput.includes('improve piqr') || lowerInput.includes('boost reliability') || lowerInput.includes('increase quality')) {
      return "To improve your PIQR score, focus on:\n1. **Schema Consistency** - Ensure structured data is consistent across pages\n2. **Semantic Clarity** - Improve content clarity to reduce AI misinterpretation\n3. **Review Quality** - Verify review legitimacy and response patterns\n4. **Voice Content** - Add voice-optimized content for better AEO performance\n5. **FAQ Schema** - Implement comprehensive FAQ structured data\n\nI can simulate interventions to forecast expected improvements. Would you like to see specific recommendations?";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      return "I'm HAL-9000, your AI cognitive assistant. I can help you:\n• Analyze dealership performance metrics\n• Identify revenue opportunities\n• Provide strategic insights\n• Navigate the Cognitive Dashboard\n• Answer questions about KPIs and ROI\n• Suggest optimization strategies\n• Analyze PIQR (AI Quality Reliability) scores\n• Run consensus checks across AI platforms\n• Diagnose content quality issues\n• Simulate interventions and forecast improvements\n\nWhat would you like to explore?";
    }
    
    // Default response
    return "I understand you're asking about: " + userInput + ". Let me analyze your dealership data and provide insights. You might find detailed information in the dAI Cognitive Dashboard or PIQR metrics in the AI Health tab. Would you like me to help you access specific insights?";
  };

  const quickActions = [
    { label: 'Sales Opportunities', query: 'Show me sales opportunities' },
    { label: 'F&I Revenue', query: 'What are F&I opportunities?' },
    { label: 'Service Growth', query: 'How can I grow service revenue?' },
    { label: 'Top Priorities', query: 'What are my top priorities?' },
    { label: 'PIQR Score', query: 'What is my PIQR score?' },
    { label: 'Diagnose Issues', query: 'Diagnose my content quality issues' }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center gap-3 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          </div>
          <span className="font-semibold hidden sm:block">HAL-9000</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">HAL-9000</h3>
                  <p className="text-sm text-blue-100">AI Cognitive Assistant</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600">HAL-9000</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">HAL is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(action.query);
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask HAL-9000 about your dealership..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HAL9000Chatbot;

