'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Search,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Star,
  Car
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  integrations?: IntegrationSuggestion[];
}

interface IntegrationSuggestion {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  benefit: string;
  required: boolean;
  connected: boolean;
}

function SelfCheckoutAgent() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [integrationData, setIntegrationData] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentSteps = [
    {
      id: 'welcome',
      message: "Hi! I'm your DealershipAI setup assistant. I'll help you connect your marketing platforms to get the most accurate AI visibility insights. What's your dealership name?",
      suggestions: ["Skip this step", "I need help"],
      type: 'text'
    },
    {
      id: 'required_setup',
      message: "Great! To get started, I need to connect at least one of these: your website URL OR your Google Business Profile. Which would you like to start with?",
      suggestions: ["Website URL", "Google Business Profile", "I have both", "I need help"],
      type: 'choice',
      choices: [
        { id: 'website', name: 'Website URL', icon: <Globe className="w-5 h-5" /> },
        { id: 'gbp', name: 'Google Business Profile', icon: <MapPin className="w-5 h-5" /> },
        { id: 'both', name: 'Both (Recommended)', icon: <CheckCircle2 className="w-5 h-5" /> }
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
        required: false
      }
    },
    {
      id: 'crm',
      message: "Excellent! Now let's talk about your CRM. Do you use HubSpot, Salesforce, or another CRM system? This helps us track lead quality and customer interactions.",
      suggestions: ["I don't use a CRM", "I use a different system", "Skip for now"],
      type: 'choice',
      choices: [
        { id: 'hubspot', name: 'HubSpot', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'salesforce', name: 'Salesforce', icon: <TrendingUp className="w-5 h-5" /> },
        { id: 'other', name: 'Other CRM', icon: <Brain className="w-5 h-5" /> }
      ]
    },
    {
      id: 'reviews',
      message: "Perfect! Finally, let's connect your review platforms. Do you monitor reviews on Yelp, DealerRater, or Cars.com? These help us track your online reputation.",
      suggestions: ["I don't monitor reviews", "I use different platforms", "Skip for now"],
      type: 'choice',
      choices: [
        { id: 'yelp', name: 'Yelp', icon: <Star className="w-5 h-5" /> },
        { id: 'dealerRater', name: 'DealerRater', icon: <Car className="w-5 h-5" /> },
        { id: 'carsCom', name: 'Cars.com', icon: <Car className="w-5 h-5" /> }
      ]
    },
    {
      id: 'goals',
      message: "Fantastic! You've connected several platforms. Now, what are your main goals with DealershipAI? Select all that apply:",
      suggestions: [],
      type: 'goals',
      goals: [
        { id: 'visibility', label: 'Improve AI visibility across platforms', icon: '👁️' },
        { id: 'revenue', label: 'Recover lost revenue from AI searches', icon: '💰' },
        { id: 'competition', label: 'Stay ahead of competitors', icon: '🏆' },
        { id: 'automation', label: 'Automate AI monitoring and responses', icon: '🤖' },
        { id: 'insights', label: 'Get actionable insights and reports', icon: '📊' }
      ]
    },
    {
      id: 'complete',
      message: "🎉 Congratulations! You've successfully set up your DealershipAI account with connected data sources. You're now ready to start tracking your AI visibility with maximum accuracy!",
      suggestions: ["Go to Dashboard", "View Setup Summary"],
      type: 'complete'
    }
  ];

  useEffect(() => {
    // Start the conversation
    addMessage('agent', agentSteps[0].message, agentSteps[0].suggestions);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type: 'user' | 'agent' | 'system', content: string, suggestions?: string[], integrations?: IntegrationSuggestion[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      suggestions,
      integrations
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (message: string, suggestions?: string[], integrations?: IntegrationSuggestion[]) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage('agent', message, suggestions, integrations);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    addMessage('user', message);
    setInputValue('');

    // Process the message and move to next step
    setTimeout(() => {
      const nextStep = currentStep + 1;
      if (nextStep < agentSteps.length) {
        setCurrentStep(nextStep);
        const step = agentSteps[nextStep];
        simulateTyping(step.message, step.suggestions, step.integrations ? [step.integration] : undefined);
      }
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleIntegrationConnect = (integrationId: string, value: string) => {
    setIntegrationData(prev => ({ ...prev, [integrationId]: value }));
    
    // Simulate connection test
    addMessage('system', `✅ ${integrationId.toUpperCase()} connected successfully!`);
    
    // Move to next step
    setTimeout(() => {
      const nextStep = currentStep + 1;
      if (nextStep < agentSteps.length) {
        setCurrentStep(nextStep);
        const step = agentSteps[nextStep];
        simulateTyping(step.message, step.suggestions, step.integrations ? [step.integration] : undefined);
      }
    }, 1000);
  };

  const handleChoiceSelect = (choiceId: string) => {
    addMessage('user', `I use ${choiceId}`);
    
    // Move to next step
    setTimeout(() => {
      const nextStep = currentStep + 1;
      if (nextStep < agentSteps.length) {
        setCurrentStep(nextStep);
        const step = agentSteps[nextStep];
        simulateTyping(step.message, step.suggestions, step.integrations ? [step.integration] : undefined);
      }
    }, 1000);
  };

  const handleGoalSelect = (goalId: string) => {
    // This would be handled in the goals step
    const nextStep = currentStep + 1;
    if (nextStep < agentSteps.length) {
      setCurrentStep(nextStep);
      const step = agentSteps[nextStep];
      simulateTyping(step.message, step.suggestions, step.integrations ? [step.integration] : undefined);
    }
  };

  const handleComplete = () => {
    router.push('/dash?onboarded=true&agent=true');
  };

  const currentStepData = agentSteps[currentStep];

  return (
    <div className="min-h-screen bg-[var(--brand-bg,#0a0b0f)] text-white">
      {/* Brand Tokens */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root{
            --brand-gradient: linear-gradient(90deg,#3b82f6, #8b5cf6);
            --brand-primary: #3b82f6;
            --brand-accent: #8b5cf6;
            --brand-bg: #0a0b0f;
            --brand-card: rgba(255,255,255,0.04);
            --brand-border: rgba(255,255,255,0.08);
            --brand-glow: 0 0 60px rgba(59,130,246,.35);
          }
          .glass{ background:var(--brand-card); border:1px solid var(--brand-border); backdrop-filter: blur(12px); }
        `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)]/70 bg-[var(--brand-bg)]/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: 'var(--brand-gradient)' }} />
            <div className="text-lg font-semibold tracking-tight">dealership<span className="font-bold" style={{ color: 'var(--brand-primary)' }}>AI</span></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/70">AI Assistant Active</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-white/70">
              Step {currentStep + 1} of {agentSteps.length}
            </div>
            <div className="text-sm text-white/70">
              {Math.round(((currentStep + 1) / agentSteps.length) * 100)}% Complete
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-[var(--brand-primary)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / agentSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="glass rounded-2xl p-6 h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === 'user' 
                    ? 'bg-[var(--brand-primary)] text-white' 
                    : message.type === 'system'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-white'
                }`}>
                  <div className="flex items-start gap-3">
                    {message.type === 'agent' && (
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-white rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Current Step Actions */}
          {currentStepData && (
            <div className="border-t border-white/20 pt-4">
              {currentStepData.type === 'integration' && currentStepData.integration && (
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                        {currentStepData.integration.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{currentStepData.integration.name}</h4>
                        <p className="text-sm text-white/70">{currentStepData.integration.description}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder={`Enter your ${currentStepData.integration.name} ID`}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            handleIntegrationConnect(currentStepData.integration!.id, e.currentTarget.value);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                          if (input?.value) {
                            handleIntegrationConnect(currentStepData.integration!.id, input.value);
                          }
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                        style={{ backgroundImage: 'var(--brand-gradient)' }}
                      >
                        Connect {currentStepData.integration.name}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStepData.type === 'choice' && currentStepData.choices && (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    {currentStepData.choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoiceSelect(choice.id)}
                        className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/20 flex items-center justify-center">
                          {choice.icon}
                        </div>
                        <span className="font-medium">{choice.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStepData.type === 'goals' && currentStepData.goals && (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    {currentStepData.goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalSelect(goal.id)}
                        className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <span className="text-2xl">{goal.icon}</span>
                        <span className="font-medium">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStepData.type === 'complete' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Setup Complete!</h3>
                    <p className="text-white/70 text-sm">
                      You've successfully connected your marketing platforms and are ready to start tracking AI visibility.
                    </p>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                    style={{ backgroundImage: 'var(--brand-gradient)' }}
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          {currentStepData && currentStepData.type === 'text' && (
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(inputValue);
                  }
                }}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary)]/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelfCheckoutAgent;
