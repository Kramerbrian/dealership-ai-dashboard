'use client'

import { useState } from 'react'
import { X, MessageSquare, Clock, Send, Bot } from 'lucide-react'
import { api } from '@/lib/trpc-client'
import ResponseTemplates from './ResponseTemplates'

interface BulkResponseModalProps {
  selectedReviews: string[]
  onClose: () => void
  onSuccess: () => void
}

export default function BulkResponseModal({ selectedReviews, onClose, onSuccess }: BulkResponseModalProps) {
  const [responseText, setResponseText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [scheduleFor, setScheduleFor] = useState<'now' | 'later'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const { data: templates } = api.reviews.getResponseTemplates.useQuery()
  const bulkRespond = api.reviews.bulkRespond.useMutation()

  const handleSubmit = async () => {
    if (!responseText.trim()) return

    try {
      await bulkRespond.mutateAsync({
        reviewIds: selectedReviews,
        responseText: responseText.trim(),
        scheduleFor,
        scheduledDate: scheduleFor === 'later' ? scheduledDate : undefined
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to send bulk response:', error)
    }
  }

  const handleTemplateSelect = (template: string) => {
    setResponseText(template)
    setSelectedTemplate(template)
  }

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true)
    try {
      // In production, this would generate a generic response based on the selected reviews
      const genericResponse = "Thank you for your feedback! We appreciate you taking the time to share your experience with us. Your input helps us continue to improve our services, and we look forward to serving you again soon!"
      setResponseText(genericResponse)
    } catch (error) {
      console.error('Failed to generate AI response:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk Response</h3>
                <p className="text-sm text-slate-500">
                  Responding to {selectedReviews.length} reviews
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Response Templates */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Quick Templates</h4>
            <ResponseTemplates
              templates={templates || []}
              onSelect={handleTemplateSelect}
              selected={selectedTemplate}
            />
          </div>

          {/* AI Generation */}
          <div>
            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Bot className="w-4 h-4" />
              {isGeneratingAI ? 'Generating...' : 'Generate AI Response'}
            </button>
          </div>

          {/* Response Text */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Response Text
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response here..."
              className="w-full h-32 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {responseText.length}/500 characters
            </p>
          </div>

          {/* Schedule Options */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">When to Send</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="now"
                  checked={scheduleFor === 'now'}
                  onChange={(e) => setScheduleFor(e.target.value as 'now')}
                  className="w-4 h-4 text-emerald-600"
                />
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">Send immediately</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="later"
                  checked={scheduleFor === 'later'}
                  onChange={(e) => setScheduleFor(e.target.value as 'later')}
                  className="w-4 h-4 text-emerald-600"
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">Schedule for later</span>
                </div>
              </label>
            </div>
            {scheduleFor === 'later' && (
              <div className="mt-3">
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!responseText.trim() || bulkRespond.isPending}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {bulkRespond.isPending ? 'Sending...' : `Send to ${selectedReviews.length} Reviews`}
          </button>
        </div>
      </div>
    </div>
  )
}
