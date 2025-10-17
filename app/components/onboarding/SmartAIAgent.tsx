'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Brain,
  Target,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  BarChart3,
  MapPin,
  Star,
  Car,
  Lightbulb,
  Clock,
  Award
} from 'lucide-react';

interface SmartMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  integrations?: IntegrationSuggestion[];
  context?: {
    dealershipName?: string;
    currentStep?: string;
    progress?: number;
  };
}

interface IntegrationSuggestion {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  benefit: string;
  required: boolean;
  connected: boolean;
  estimatedTime?: string;
}

interface SmartAIAgentProps {
  onComplete: () => void;
  userData?: {
    name?: string;
    company?: string;
    plan?: string;
  };
}

export default function SmartAIAgent({ onComplete, userData }: SmartAIAgentProps) {
  const [messages, setMessages] = useState<SmartMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [integrationData, setIntegrationData] = useState<Record<string, any>>({});
  const [context, setContext] = useState({
    dealershipName: '',
    progress: 0,
    timeStarted: Date.now()
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const smartSteps = [
    {
      id: 'welcome',
      message: `👋 Hi ${userData?.name || 'there'}! I'm your personal AI setup assistant. I'll guide you through connecting your marketing platforms in just 3-7 minutes to unlock 10x more accurate AI visibility tracking. What's your dealership name?`,
      suggestions: ["Skip this step", "I need help", "Let's get started!"],
      type: 'text',
      estimatedTime: '30 seconds'
    },
    {
      id: 'required_setup',
      message: "Great! To get started, I need to connect at least one of these: your website URL OR your Google Business Profile. Which would you like to start with?",
      suggestions: ["Website URL", "Google Business Profile", "I have both", "I need help"],
      type: 'choice',
      choices: [
        { id: 'website', name: 'Website URL', icon: <Globe className="w-5 h-5" />, estimatedTime: '1 minute' },
        { id: 'gbp', name: 'Google Business Profile', icon: <MapPin className="w-5 h-5" />, estimatedTime: '2 minutes' },
        { id: 'both', name: 'Both (Recommended)', icon: <CheckCircle2 className="w-5 h-5" />, estimatedTime: '3 minutes' }
      ]
    },
    {
      id: 'google_analytics',
      message: "Perfect! Now, do you use Google Analytics 4? If yes, I can help you connect it for 87% more accurate traffic insights. What's your GA4 Property ID?",
      suggestions: ["I don't use Google Analytics", "I need help finding this", "Skip for now"],
      type: 'integration',
      integration: {
        id: 'ga4',
        name: 'Google Analytics 4',
        description: 'Track website traffic and user behavior',
        icon: <BarChart3 className="w-5 h-5" />,
        benefit: '87% more accurate traffic insights',
        required: false,
        connected: false,
        estimatedTime: '2 minutes'
      }
    },
    {
      id: 'goals',
      message: "Excellent! Now let's set your goals. What's most important for your dealership's AI visibility?",
      suggestions: ["Increase local search visibility", "Track competitor performance", "Improve lead quality", "All of the above"],
      type: 'choice',
      choices: [
        { id: 'local', name: 'Local Search Visibility', icon: <MapPin className="w-5 h-5" /> },
        { id: 'competitor', name: 'Competitor Tracking', icon: <Target className="w-5 h-5" /> },
        { id: 'leads', name: 'Lead Quality', icon: <TrendingUp className="w-5 h-5" /> },
        { id: 'all', name: 'Everything', icon: <Star className="w-5 h-5" /> }
      ]
    },
    {
      id: 'completion',
      message: "🎉 Fantastic! You're all set up. I've connected your platforms and configured your AI visibility tracking. You'll start receiving insights within the next 5 minutes!",
      suggestions: ["View my dashboard", "Get help", "Start tracking"],
      type: 'completion'
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        type: 'agent',
        content: smartSteps[0].message,
        timestamp: new Date(),
        suggestions: smartSteps[0].suggestions,
        context: { currentStep: 'welcome', progress: 0 }
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: Omit<SmartMessage, 'id'>) => {
    const newMessage: SmartMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (message: string, callback: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1500 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addMessage({
      type: 'user',
      content: suggestion,
      timestamp: new Date(),
      context: { currentStep: smartSteps[currentStep].id, progress: currentStep }
    });

    // Process suggestion
    if (suggestion === "Let's get started!" || suggestion === "Skip this step") {
      nextStep();
    } else if (suggestion === "I need help") {
      showHelp();
    } else {
      processUserInput(suggestion);
    }
  };

  const processUserInput = (input: string) => {
    const currentStepData = smartSteps[currentStep];
    
    if (currentStepData.id === 'welcome') {
      setContext(prev => ({ ...prev, dealershipName: input }));
      nextStep();
    } else if (currentStepData.id === 'required_setup') {
      // Handle setup choice
      nextStep();
    } else if (currentStepData.id === 'google_analytics') {
      if (input !== "I don't use Google Analytics" && input !== "Skip for now") {
        setIntegrationData(prev => ({ ...prev, ga4PropertyId: input }));
      }
      nextStep();
    } else if (currentStepData.id === 'goals') {
      nextStep();
    }
  };

  const nextStep = () => {
    if (currentStep < smartSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      
      const nextStepData = smartSteps[nextStepIndex];
      const progress = (nextStepIndex / (smartSteps.length - 1)) * 100;
      
      simulateTyping(nextStepData.message, () => {
        addMessage({
          type: 'agent',
          content: nextStepData.message,
          timestamp: new Date(),
          suggestions: nextStepData.suggestions,
          integrations: nextStepData.integration ? [nextStepData.integration] : undefined,
          context: { 
            currentStep: nextStepData.id, 
            progress,
            dealershipName: context.dealershipName 
          }
        });
      });
    } else {
      // Complete onboarding
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const showHelp = () => {
    const helpMessage = "I'm here to help! I can guide you through connecting your website, Google Business Profile, and Google Analytics. Just let me know what you'd like to do or if you have any questions.";
    
    simulateTyping(helpMessage, () => {
      addMessage({
        type: 'agent',
        content: helpMessage,
        timestamp: new Date(),
        suggestions: ["Continue setup", "Skip to dashboard", "Contact support"]
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage({
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      context: { currentStep: smartSteps[currentStep].id, progress: currentStep }
    });

    processUserInput(inputValue);
    setInputValue('');
  };

  const getProgressColor = () => {
    if (context.progress < 25) return 'bg-red-500';
    if (context.progress < 50) return 'bg-yellow-500';
    if (context.progress < 75) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)]/70 bg-[var(--brand-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-4xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <div className="text-lg font-semibold">AI Setup Assistant</div>
              <div className="text-xs text-white/60">
                {context.dealershipName ? `${context.dealershipName} • ` : ''}
                {Math.round((Date.now() - context.timeStarted) / 1000)}s
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-white/70">
              {Math.round(context.progress)}% Complete
            </div>
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${context.progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-5 py-6">
        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'glass border border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-[var(--brand-primary)]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Integration Cards */}
                    {message.integrations && (
                      <div className="mt-4 space-y-2">
                        {message.integrations.map((integration) => (
                          <div key={integration.id} className="glass rounded-lg p-3 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                                {integration.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{integration.name}</div>
                                <div className="text-xs text-white/70">{integration.benefit}</div>
                                {integration.estimatedTime && (
                                  <div className="text-xs text-white/50 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {integration.estimatedTime}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-[var(--brand-primary)]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundImage: 'var(--brand-gradient)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
