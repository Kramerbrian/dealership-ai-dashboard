'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import type { Message } from '@dealershipai/shared'

interface HALChatProps {
  dealerId: string
  domain?: string
}

export function HALChat({ dealerId, domain }: HALChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello. I am HAL, your AI Chief Strategy Officer. I can analyze visibility, compute QAI, calculate OCI, generate ASRs, and analyze UGC. What would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: parseIntent(input),
          dealerId,
          domain,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatResponse(data, input),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const parseIntent = (input: string): string => {
    const lower = input.toLowerCase()
    if (lower.includes('visibility') || lower.includes('aiv')) return 'analyze_visibility'
    if (lower.includes('qai')) return 'compute_qai'
    if (lower.includes('oci')) return 'calculate_oci'
    if (lower.includes('asr') || lower.includes('recommend')) return 'generate_asr'
    if (lower.includes('ugc') || lower.includes('sentiment')) return 'analyze_ugc'
    return 'generate_asr'
  }

  const formatResponse = (response: any, originalQuery: string): string => {
    if (!response.success) {
      return `I couldn't process that request: ${response.error || 'Unknown error'}`
    }
    return JSON.stringify(response.result, null, 2)
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <Bot className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="font-semibold">HAL — AI Chief Strategy Officer</h3>
          <p className="text-xs text-gray-500">Powered by Orchestrator 3.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div
              className={`flex-1 p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <Bot className="w-4 h-4 text-gray-400" />
            <div className="text-sm text-gray-500">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask HAL about visibility, QAI, OCI, ASRs..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

