'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Zap, Clock, Target, TrendingUp } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
  isQuickAction?: boolean
}

interface QuickAction {
  id: string
  name: string
  icon: React.ReactNode
  action: () => void
}

export default function EnhancedChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! I'm your DealershipAI assistant. Ready to dive into some witty insights about your dealership's performance? 🚗✨",
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'symmetry',
      name: 'Symmetry Mode',
      icon: <Target className="w-4 h-4" />,
      action: () => handleQuickAction('symmetry')
    },
    {
      id: 'time-dilation',
      name: 'Time Dilation',
      icon: <Clock className="w-4 h-4" />,
      action: () => handleQuickAction('time-dilation')
    },
    {
      id: 'trending',
      name: 'Trend Analysis',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => handleQuickAction('trending')
    },
    {
      id: 'ai-visibility',
      name: 'AI Visibility',
      icon: <Zap className="w-4 h-4" />,
      action: () => handleQuickAction('ai-visibility')
    }
  ]

  const cannedResponses: Record<string, string> = {
    'symmetry': "🎯 **Symmetry Mode Activated!** Your QAI scores are beautifully balanced across all channels - it's like watching a perfectly choreographed ballet, but with more horsepower and fewer tutus. Your digital presence is so symmetrical, even Pythagoras would be jealous!",
    'time-dilation': "⏰ **Time Dilation Engaged!** Your marketing campaigns are moving at relativistic speeds while your competitors are stuck in Newtonian physics. Einstein would be proud - you've achieved the impossible: making time work *for* you instead of against you!",
    'trending': "📈 **Trend Analysis Complete!** Your AI Visibility Index is trending upward faster than a Tesla on Ludicrous Mode. The data shows you're not just keeping up with the competition - you're lapping them in the digital race!",
    'ai-visibility': "🤖 **AI Visibility Report:** Your dealership is showing up in AI responses 23% more than last month. You're basically the Ryan Reynolds of automotive AI - witty, charming, and impossible to ignore!"
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleQuickAction = (actionId: string) => {
    const response = cannedResponses[actionId]
    if (response) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
        isQuickAction: true
      }
      setMessages(prev => [...prev, newMessage])
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me analyze your data and give you some insights that'll make your competitors weep with envy. 😎",
        "Ah, I see what you're getting at! Your metrics are telling a story, and it's a page-turner. Let me break it down for you...",
        "Excellent query! I've crunched the numbers and the results are... well, let's just say your dealership is performing like a well-tuned engine! 🚗",
        "Now that's the kind of strategic thinking I like to see! Here's what the data reveals about your performance..."
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900">DealershipAI Assistant</h3>
        <p className="text-sm text-gray-600">Your witty AI companion for dealership insights</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {action.icon}
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isQuickAction
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your dealership's performance..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
