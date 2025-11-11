'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, Bot, User } from 'lucide-react'

export default function DealerGPT2() {
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}>>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `I understand you're asking about "${input}". Let me analyze your dealership's AI visibility metrics and provide some insights...`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsProcessing(false)
    }, 1500)
  }

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    setIsListening(true)
    // Simulate voice recognition
    setTimeout(() => {
      setInput('What are my top AI visibility opportunities?')
      setIsListening(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Bot className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">DealerGPT 2.0</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-500">Voice Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Ask me anything about your AI visibility metrics!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-600' : 'bg-gray-200'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className={`rounded-lg px-3 py-2 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <button
            onClick={handleVoiceInput}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your AI visibility metrics..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}