'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, Loader2, X, Maximize2, Minimize2 } from 'lucide-react'

interface AIAssistantQueryProps {
  context: string
  data: any
  theme?: 'light' | 'dark'
  placeholder?: string
  onQuery?: (query: string) => string
  className?: string
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AIAssistantQuery: React.FC<AIAssistantQueryProps> = ({
  context,
  data,
  theme = 'dark',
  placeholder = "Ask about your metrics...",
  onQuery,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const themeClasses = {
    light: 'bg-white border-gray-200 text-gray-900',
    dark: 'bg-gray-900 border-gray-700 text-white'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const generateContextualResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    // Revenue at Risk analysis
    if (lowerQuery.includes('revenue') || lowerQuery.includes('risk')) {
      const revenue = data.revenueAtRisk || 0
      const isCritical = revenue > 300000
      return `Your $${(revenue/1000).toFixed(0)}K revenue at risk is ${isCritical ? 'critically high' : 'manageable'}. ${isCritical ? 'Immediate action needed to optimize AI visibility and reduce exposure.' : 'Continue monitoring and optimizing your AI search presence.'}`
    }
    
    // AI Visibility analysis
    if (lowerQuery.includes('visibility') || lowerQuery.includes('ai visibility')) {
      const visibility = data.aiVisibility || 0
      const status = visibility >= 80 ? 'excellent' : visibility >= 60 ? 'good' : 'needs improvement'
      return `Your AI visibility is ${visibility}%, which is ${status}. ${visibility < 80 ? 'Focus on optimizing your E-E-A-T signals and ensuring consistent business information across all platforms.' : 'Great job! Continue monitoring and fine-tuning your AI search presence.'}`
    }
    
    // Impressions trend analysis
    if (lowerQuery.includes('trend') || lowerQuery.includes('impressions') || lowerQuery.includes('growth')) {
      const trends = data.impressionsTrend || []
      if (trends.length >= 2) {
        const latest = trends[trends.length - 1]?.impressions || 0
        const previous = trends[trends.length - 2]?.impressions || 0
        const growth = ((latest - previous) / previous * 100).toFixed(1)
        const direction = latest > previous ? 'increasing' : 'decreasing'
        return `Your impressions trend is ${direction} by ${Math.abs(parseFloat(growth))}% to ${latest.toLocaleString()}. This indicates ${latest > previous ? 'positive momentum' : 'potential optimization opportunities'} in your AI search visibility.`
      }
      return 'Impressions trend data is being analyzed. This metric shows how well your dealership appears in AI search results.'
    }
    
    // Critical alerts analysis
    if (lowerQuery.includes('alert') || lowerQuery.includes('critical') || lowerQuery.includes('urgent')) {
      const hasAlerts = data.criticalAlerts || false
      return hasAlerts 
        ? 'You have critical alerts requiring immediate attention. Revenue at risk is above $300K threshold. Focus on AI visibility optimization and review your business information consistency.'
        : 'No critical alerts at this time. Your metrics are within acceptable ranges.'
    }
    
    // General context-aware responses
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return `I can help you analyze your dealership's AI visibility metrics:

• Revenue at Risk: Currently $${(data.revenueAtRisk/1000).toFixed(0)}K
• AI Visibility: ${data.aiVisibility}%
• Critical Alerts: ${data.criticalAlerts ? 'Yes' : 'No'}

Ask me about trends, optimization strategies, or specific metrics!`
    }
    
    // Default contextual response
    return `Based on your current metrics (${data.aiVisibility}% AI visibility, $${(data.revenueAtRisk/1000).toFixed(0)}K revenue at risk), I can help you understand trends and optimization opportunities. What specific aspect would you like to explore?`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const query = inputValue
    setInputValue('')
    setIsLoading(true)

    // Generate contextual response
    setTimeout(() => {
      const response = onQuery ? onQuery(query) : generateContextualResponse(query)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 800 + Math.random() * 1200) // Random delay between 0.8-2 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className={`absolute bottom-full right-0 mb-2 w-80 h-96 ${themeClasses[theme]} rounded-lg shadow-2xl border flex flex-col transition-all duration-300 ${
          isExpanded ? 'fixed inset-4 w-auto h-auto' : ''
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-3 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI Assistant</h3>
                <p className="text-xs opacity-70">{context}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1 rounded hover:bg-opacity-20 ${theme === 'light' ? 'hover:bg-gray-500' : 'hover:bg-white'}`}
              >
                {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded hover:bg-opacity-20 ${theme === 'light' ? 'hover:bg-gray-500' : 'hover:bg-white'}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm opacity-70 py-8">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Ask me about your metrics!</p>
                <p className="text-xs mt-1">Try: "How is my revenue at risk?"</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2 text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : theme === 'light'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'assistant' && (
                      <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`max-w-[85%] rounded-lg p-2 text-sm ${
                  theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-white'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Bot className="w-3 h-3" />
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-3 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-gray-800 border-gray-600 text-white'
                }`}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full rounded-2xl border p-4 text-left transition ${
          theme === 'light'
            ? 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
            : 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium">AI Assistant</div>
            <div className="text-xs opacity-70">Ask about your metrics</div>
          </div>
        </div>
      </button>
    </div>
  )
}

export { AIAssistantQuery }
