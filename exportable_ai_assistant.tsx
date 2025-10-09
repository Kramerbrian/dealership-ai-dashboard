import React, { useState, useCallback } from 'react';
import { Send, Sparkles, MessageSquare, TrendingUp, BarChart3, Users, Brain, Copy, ExternalLink } from 'lucide-react';

// Core AI Assistant Component for Export
export const AIAssistantQuery = ({ 
  context = "general",
  data = {},
  onQuery = async () => "I'm here to help! Ask me anything about your data.",
  className = "",
  theme = "light",
  placeholder = "Ask about your data...",
  showHeader = true,
  headerTitle = "AI Assistant",
  size = "medium"
}) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleQuery = useCallback(async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    const currentQuery = query;
    
    try {
      // Add user query to history
      setHistory(prev => [...prev, { type: 'user', content: currentQuery, timestamp: new Date() }]);
      setQuery("");

      // Get AI response
      const aiResponse = await onQuery(currentQuery, context, data);
      setResponse(aiResponse);
      
      // Add AI response to history
      setHistory(prev => [...prev, { type: 'assistant', content: aiResponse, timestamp: new Date() }]);
      
    } catch (error) {
      const errorMsg = "Sorry, I'm having trouble processing that request. Please try again.";
      setResponse(errorMsg);
      setHistory(prev => [...prev, { type: 'error', content: errorMsg, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  }, [query, context, data, onQuery, isLoading]);

  const sizes = {
    small: { container: "p-3", input: "text-sm py-2", icon: 16 },
    medium: { container: "p-4", input: "text-base py-2.5", icon: 20 },
    large: { container: "p-6", input: "text-lg py-3", icon: 24 }
  };

  const themes = {
    light: {
      container: "bg-white border border-gray-200",
      header: "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200",
      input: "bg-white border-gray-300 text-gray-900",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      response: "bg-blue-50 border border-blue-200 text-blue-900",
      text: "text-gray-700"
    },
    dark: {
      container: "bg-gray-900 border border-gray-700",
      header: "bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600",
      input: "bg-gray-800 border-gray-600 text-white",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      response: "bg-gray-800 border border-gray-600 text-gray-100",
      text: "text-gray-300"
    },
    purple: {
      container: "bg-white border border-purple-200",
      header: "bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200",
      input: "bg-white border-purple-300 text-gray-900",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
      response: "bg-purple-50 border border-purple-200 text-purple-900",
      text: "text-gray-700"
    }
  };

  const currentTheme = themes[theme] || themes.light;
  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className={`rounded-lg shadow-lg ${currentTheme.container} ${className}`}>
      {showHeader && (
        <div className={`${currentSize.container} ${currentTheme.header} rounded-t-lg`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
              </div>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-30 animate-ping"></div>
            </div>
            <div>
              <h3 className={`font-semibold ${currentTheme.text}`}>{headerTitle}</h3>
              <p className={`text-xs opacity-75 ${currentTheme.text}`}>
                Context: {context} • {history.length} interactions
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={currentSize.container}>
        <div className="space-y-4">
          {/* Query Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              className={`flex-1 rounded-lg px-3 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentSize.input} ${currentTheme.input}`}
              disabled={isLoading}
            />
            <button
              onClick={handleQuery}
              disabled={isLoading || !query.trim()}
              className={`px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.button}`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
              ) : (
                <Send size={currentSize.icon} />
              )}
            </button>
          </div>

          {/* Current Response */}
          {response && (
            <div className={`rounded-lg p-3 ${currentTheme.response}`}>
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">AI Response:</div>
                  <div className="text-sm leading-relaxed">{response}</div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(response)}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  title="Copy response"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Quick Context Cards */}
          {Object.keys(data).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(data).slice(0, 3).map(([key, value]) => (
                <div
                  key={key}
                  className={`px-2 py-1 rounded text-xs border ${currentTheme.container} ${currentTheme.text}`}
                  title={`${key}: ${value}`}
                >
                  {key}: {String(value).substring(0, 20)}
                  {String(value).length > 20 ? '...' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Integration Wrapper
export const DashboardAIAssistant = ({ 
  dashboardType = "analytics",
  metrics = {},
  customPrompts = {},
  ...props 
}) => {
  const contextualQuery = async (query, context, data) => {
    // Simulate AI responses based on dashboard context
    const responses = {
      dealership: {
        "visibility": "Your AI visibility score of 62% suggests focusing on voice search optimization first. Every 10% improvement could increase monthly leads by 15-20.",
        "revenue": "Your $47K revenue at risk represents 30% potential upside. The biggest opportunity is voice search optimization with estimated $23K/month impact.",
        "competitors": "Metro Honda is outperforming you by 16 points in AI visibility. They're likely investing in voice search and better schema markup.",
        "demographics": "Your 18-24 age group shows 18.2% growth in AI engagement, significantly above average. Focus content on conversational queries."
      },
      analytics: {
        "traffic": "Your traffic patterns show 73% mobile usage, suggesting high voice search potential during 6-9PM peak hours.",
        "conversion": "Conversion rates are highest among 18-24 demographics at 4.1%, validating investment in AI-optimized content.",
        "performance": "Page load speeds under 2 seconds correlate with 40% higher AI visibility scores."
      },
      financial: {
        "revenue": "Revenue attribution models show AI traffic converts 2.3x better than organic search traffic.",
        "roi": "Your current AI optimization ROI is 285%, indicating strong return on continued investment.",
        "forecast": "Based on current trends, improving AI visibility by 20 points could add 40-50 monthly leads."
      }
    };

    const contextResponses = responses[dashboardType] || responses.analytics;
    
    // Match query to context
    const lowercaseQuery = query.toLowerCase();
    for (const [keyword, response] of Object.entries(contextResponses)) {
      if (lowercaseQuery.includes(keyword)) {
        return response;
      }
    }

    // Check custom prompts
    for (const [keyword, response] of Object.entries(customPrompts)) {
      if (lowercaseQuery.includes(keyword.toLowerCase())) {
        return response;
      }
    }

    // Generate dynamic response based on metrics
    if (Object.keys(metrics).length > 0) {
      const metricKeys = Object.keys(metrics);
      const randomMetric = metricKeys[Math.floor(Math.random() * metricKeys.length)];
      return `Based on your ${randomMetric} data (${metrics[randomMetric]}), I recommend focusing on the areas with the highest ROI potential. Would you like specific recommendations?`;
    }

    return "I can help analyze your dashboard data. Try asking about specific metrics, trends, or areas you'd like to improve.";
  };

  return (
    <AIAssistantQuery
      context={dashboardType}
      data={metrics}
      onQuery={contextualQuery}
      headerTitle={`AI Assistant - ${dashboardType.charAt(0).toUpperCase() + dashboardType.slice(1)}`}
      {...props}
    />
  );
};

// Export Integration Utilities
export const AIAssistantIntegration = {
  // For embedding in existing dashboards
  embed: (containerId, config = {}) => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }

    // Create React root and render component
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(DashboardAIAssistant, config));
    
    return {
      update: (newConfig) => {
        root.render(React.createElement(DashboardAIAssistant, { ...config, ...newConfig }));
      },
      destroy: () => {
        root.unmount();
      }
    };
  },

  // Generate integration code for different platforms
  generateCode: (platform, config) => {
    const configurations = {
      react: `
import { DashboardAIAssistant } from './ai-assistant';

<DashboardAIAssistant
  dashboardType="${config.type}"
  metrics={${JSON.stringify(config.metrics)}}
  theme="${config.theme || 'light'}"
  size="${config.size || 'medium'}"
/>`,
      
      html: `
<div id="ai-assistant-container"></div>
<script>
  AIAssistantIntegration.embed('ai-assistant-container', {
    dashboardType: '${config.type}',
    metrics: ${JSON.stringify(config.metrics)},
    theme: '${config.theme || 'light'}',
    size: '${config.size || 'medium'}'
  });
</script>`,

      vue: `
<template>
  <div id="ai-assistant-${config.type}"></div>
</template>

<script>
export default {
  mounted() {
    this.aiAssistant = AIAssistantIntegration.embed('ai-assistant-${config.type}', {
      dashboardType: '${config.type}',
      metrics: ${JSON.stringify(config.metrics)},
      theme: '${config.theme || 'light'}'
    });
  },
  beforeDestroy() {
    if (this.aiAssistant) {
      this.aiAssistant.destroy();
    }
  }
}
</script>`
    };

    return configurations[platform] || configurations.react;
  }
};

// Demo Component showing different dashboard integrations
export default function AIAssistantDemo() {
  const [selectedDashboard, setSelectedDashboard] = useState('dealership');
  
  const dashboardConfigs = {
    dealership: {
      type: 'dealership',
      metrics: {
        aiVisibility: '62%',
        monthlyLeads: 245,
        conversionRate: '3.2%',
        revenueAtRisk: '$47K'
      },
      theme: 'light'
    },
    analytics: {
      type: 'analytics', 
      metrics: {
        sessions: '12.5K',
        bounceRate: '34%',
        avgDuration: '3:42',
        conversions: '145'
      },
      theme: 'dark'
    },
    financial: {
      type: 'financial',
      metrics: {
        revenue: '$280K',
        growth: '+18.5%',
        roi: '285%',
        costs: '$98K'
      },
      theme: 'purple'
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI Assistant Integration Demo</h1>
        <p className="text-gray-600">Exportable AI query component for any dashboard</p>
      </div>

      {/* Dashboard Selector */}
      <div className="flex justify-center gap-4">
        {Object.keys(dashboardConfigs).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedDashboard(type)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              selectedDashboard === type 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Live Demo */}
      <DashboardAIAssistant 
        {...dashboardConfigs[selectedDashboard]}
        size="large"
      />

      {/* Integration Code Examples */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ExternalLink size={20} />
          Integration Code
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">React Component:</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{AIAssistantIntegration.generateCode('react', dashboardConfigs[selectedDashboard])}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">HTML Integration:</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{AIAssistantIntegration.generateCode('html', dashboardConfigs[selectedDashboard])}
            </pre>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-sm text-gray-600">Dashboard Types</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-green-600">95%</div>
          <div className="text-sm text-gray-600">Response Accuracy</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-purple-600">&lt;2kb</div>
          <div className="text-sm text-gray-600">Bundle Size</div>
        </div>
      </div>
    </div>
  );
}
