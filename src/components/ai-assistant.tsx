'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, X, Maximize2, Minimize2 } from 'lucide-react'

interface DashboardAIAssistantProps {
  dashboardType: 'dealership' | 'enterprise' | 'multi-tenant'
  metrics: {
    aiVisibility: string
    monthlyLeads: number
    revenueAtRisk: string
  }
  theme?: 'light' | 'dark'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const DashboardAIAssistant: React.FC<DashboardAIAssistantProps> = ({
  dashboardType,
  metrics,
  theme = 'light',
  size = 'medium',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI assistant for the ${dashboardType} dashboard. I can help you understand your metrics, optimize your AI visibility, and answer questions about your data. How can I help you today?`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    small: 'w-80 h-96',
    medium: 'w-96 h-[28rem]',
    large: 'w-[32rem] h-[36rem]'
  }

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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response based on dashboard type and metrics
    setTimeout(() => {
      const response = generateAIResponse(inputValue, dashboardType, metrics)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const generateAIResponse = (query: string, type: string, metrics: any): string => {
    const lowerQuery = query.toLowerCase()
    
    // AI Visibility related responses
    if (lowerQuery.includes('visibility') || lowerQuery.includes('ai visibility')) {
      return `Your current AI visibility is ${metrics.aiVisibility}. This metric shows how well your dealership appears in AI search results across ChatGPT, Claude, and Perplexity. To improve this, focus on optimizing your website's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals and ensure your business information is consistent across all platforms.`
    }
    
    // Leads related responses
    if (lowerQuery.includes('lead') || lowerQuery.includes('leads')) {
      return `You're currently generating ${metrics.monthlyLeads} leads per month. This is a solid foundation! To increase lead generation, consider optimizing your local SEO, improving your Google Business Profile, and ensuring your contact information is easily accessible in AI search results.`
    }
    
    // Revenue related responses
    if (lowerQuery.includes('revenue') || lowerQuery.includes('money') || lowerQuery.includes('risk')) {
      return `Your current revenue at risk is ${metrics.revenueAtRisk}. This represents potential revenue loss due to poor AI visibility. By improving your AI search presence, you could potentially recover a significant portion of this revenue. Focus on the highest-impact optimizations first.`
    }
    
    // General dashboard help
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return `I can help you with:
• Understanding your AI visibility metrics
• Optimizing your dealership's online presence
• Analyzing your lead generation performance
• Interpreting revenue at risk data
• Providing actionable recommendations
• Answering questions about your dashboard data

What would you like to know more about?`
    }
    
    // Default responses
    const responses = [
      `Based on your ${type} dashboard data, I can see you have ${metrics.aiVisibility} AI visibility with ${metrics.monthlyLeads} monthly leads. How can I help you optimize these metrics?`,
      `I notice your revenue at risk is ${metrics.revenueAtRisk}. Would you like me to suggest some strategies to improve your AI search visibility and reduce this risk?`,
      `Your current metrics show ${metrics.aiVisibility} AI visibility. This is a good starting point! What specific aspect of your dealership's online presence would you like to improve?`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className={`${sizeClasses[size]} ${themeClasses[theme]} rounded-lg shadow-2xl border flex flex-col transition-all duration-300 ${
          isExpanded ? 'fixed inset-4 w-auto h-auto' : ''
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs opacity-70">{dashboardType} Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1 rounded hover:bg-opacity-20 ${theme === 'light' ? 'hover:bg-gray-500' : 'hover:bg-white'}`}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded hover:bg-opacity-20 ${theme === 'light' ? 'hover:bg-gray-500' : 'hover:bg-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
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
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : theme === 'light'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'assistant' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-white'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your dashboard..."
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

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center group"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  )
}

export { DashboardAIAssistant }
