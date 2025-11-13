'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, 
  Send, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  Users,
  X,
  Bot,
  User,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    provider?: 'claude' | 'gpt-4'
    tokens?: number
    function_calls?: any[]
  }
}

interface ChatSession {
  id: string
  messages: Message[]
  context: {
    dealerId: string
    tenantId: string
    userRole: string
    subscriptionTier: string
  }
  tokenUsage: {
    monthly: number
    limit: number
    remaining: number
  }
}

interface ConversationalAssistantProps {
  tenantId: string
  dealerId: string
  userRole?: string
  subscriptionTier?: string
  isOpen: boolean
  onClose: () => void
}

const LUDICROUS_BUTTONS = [
  { id: 'warp-drive', label: 'Warp Drive', icon: Zap, description: 'Quick performance summary' },
  { id: 'scan-competitors', label: 'Scan Competitors', icon: Target, description: 'Competitive analysis' },
  { id: 'respond-reviews', label: 'Ludicrous Response', icon: Shield, description: 'Review management' },
  { id: 'mystery-shop', label: 'Mystery Shop', icon: Users, description: 'Test customer experience' },
  { id: 'trends', label: 'Marketing Trends', icon: TrendingUp, description: 'Performance insights' }
]

const PLACEHOLDER_PROMPTS = [
  "Ask about your AI Visibility Index...",
  "What's our QAI score this week?",
  "Show me marketing trends vs last month",
  "Generate a response to this negative review",
  "Run a mystery shopper test for EV inventory"
]

export default function ConversationalAssistant({
  tenantId,
  dealerId,
  userRole = 'manager',
  subscriptionTier = 'premium',
  isOpen,
  onClose
}: ConversationalAssistantProps) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session
  useEffect(() => {
    if (isOpen && !session) {
      initializeSession()
    }
  }, [isOpen, session])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages])

  // Rotate placeholder prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt(prev => (prev + 1) % PLACEHOLDER_PROMPTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          dealerId,
          userRole,
          subscriptionTier
        })
      })
      
      const newSession = await response.json()
      setSession(newSession)
    } catch (error) {
      console.error('Failed to initialize chat session:', error)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    // Add user message immediately
    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null)

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: content.trim(),
          context: session.context
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, result.assistantMessage],
          tokenUsage: result.tokenUsage || prev.tokenUsage
        } : null)
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: 'system',
          content: result.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
        setSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, errorMessage]
        } : null)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Connection error. Please check your network and try again.',
        timestamp: new Date()
      }
      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (actionId: string) => {
    const actions: Record<string, string> = {
      'warp-drive': 'Give me a quick performance summary of our key metrics',
      'scan-competitors': 'Run a competitive analysis of our top 3 local competitors',
      'respond-reviews': 'Show me recent negative reviews that need responses',
      'mystery-shop': 'Run a mystery shopper test for our EV inventory inquiry',
      'trends': 'Show me marketing performance trends for the last 30 days'
    }

    const prompt = actions[actionId]
    if (prompt) {
      await sendMessage(prompt)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const getTokenUsageColor = () => {
    if (!session) return 'bg-gray-200'
    const percentage = (session.tokenUsage.used / session.tokenUsage.limit) * 100
    if (percentage > 90) return 'bg-red-500'
    if (percentage > 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-end">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">DealershipAI Assistant</h2>
              <p className="text-sm opacity-90">Your digital performance co-pilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Token Usage Bar */}
        {session && (
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {session.tokenUsage.provider === 'claude' ? 'Claude' : 'GPT-4'} • 
                {session.tokenUsage.used.toLocaleString()} / {session.tokenUsage.limit.toLocaleString()} tokens
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getTokenUsageColor()}`}
                  style={{ 
                    width: `${Math.min((session.tokenUsage.used / session.tokenUsage.limit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-5 gap-2">
            {LUDICROUS_BUTTONS.map((button) => (
              <button
                key={button.id}
                onClick={() => handleQuickAction(button.id)}
                disabled={isLoading}
                className="flex flex-col items-center p-3 bg-white rounded-lg border hover:border-indigo-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={button.description}
              >
                <button.icon className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {button.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {session?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.type === 'system'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {message.type === 'system' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.metadata?.provider && (
                        <span className="capitalize">{message.metadata.provider}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={PLACEHOLDER_PROMPTS[currentPrompt]}
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
