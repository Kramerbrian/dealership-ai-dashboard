'use client'

import { useState } from 'react'
import { Star, MessageSquare, Clock, CheckCircle, ExternalLink, Bot } from 'lucide-react'
import { api } from '@/lib/trpc-client'

interface Review {
  id: string
  platform: 'google' | 'facebook' | 'cars' | 'dealerrater'
  rating: number
  text: string
  author: string
  date: string
  sentiment: 'positive' | 'neutral' | 'negative'
  hasResponse: boolean
  responseText: string | null
  responseDate: string | null
  url: string
}

interface ReviewCardProps {
  review: Review
  selected: boolean
  onSelect: () => void
}

export default function ReviewCard({ review, selected, onSelect }: ReviewCardProps) {
  const [showFullText, setShowFullText] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const platformColors = {
    google: 'bg-blue-100 text-blue-800',
    facebook: 'bg-blue-100 text-blue-800',
    cars: 'bg-purple-100 text-purple-800',
    dealerrater: 'bg-orange-100 text-orange-800',
  }

  const sentimentColors = {
    positive: 'text-emerald-600 bg-emerald-50',
    neutral: 'text-slate-600 bg-slate-50',
    negative: 'text-red-600 bg-red-50',
  }

  const generateAIResponse = api.reviews.generateAIResponse.useMutation()
  const respondToReview = api.reviews.respondToReview.useMutation()

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-amber-400 fill-current' : 'text-slate-300'
        }`}
      />
    ))
  }

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true)
    try {
      const result = await generateAIResponse.mutateAsync({
        reviewId: review.id,
        reviewText: review.text,
        rating: review.rating,
        sentiment: review.sentiment
      })
      setResponseText(result.response)
    } catch (error) {
      console.error('Failed to generate AI response:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return

    try {
      await respondToReview.mutateAsync({
        reviewId: review.id,
        responseText: responseText.trim(),
        scheduleFor: 'now'
      })
      setShowResponseModal(false)
      setResponseText('')
    } catch (error) {
      console.error('Failed to submit response:', error)
    }
  }

  return (
    <>
      <div className={`bg-white rounded-xl border-2 transition-all ${
        selected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
      }`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={onSelect}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selected
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 hover:border-emerald-500'
              }`}
            >
              {selected && <CheckCircle className="w-3 h-3" />}
            </button>

            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-semibold">
              {review.author[0].toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{review.author}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[review.platform]}`}>
                      {review.platform}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sentimentColors[review.sentiment]}`}>
                      {review.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-slate-500">{review.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!review.hasResponse && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                      Needs Response
                    </span>
                  )}
                  <button 
                    onClick={() => window.open(review.url, '_blank')}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-4">
                <p className="text-slate-700 leading-relaxed">
                  {showFullText || review.text.length <= 200
                    ? review.text
                    : `${review.text.substring(0, 200)}...`
                  }
                </p>
                {review.text.length > 200 && (
                  <button
                    onClick={() => setShowFullText(!showFullText)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1"
                  >
                    {showFullText ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Response Section */}
              {review.hasResponse ? (
                <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-emerald-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-600">Your Response</span>
                    <span className="text-xs text-slate-500">{review.responseDate}</span>
                  </div>
                  <p className="text-slate-700">{review.responseText}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowResponseModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Respond
                  </button>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <Bot className="w-4 h-4" />
                    {isGeneratingAI ? 'Generating...' : 'AI Response'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    <Clock className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Respond to Review</h3>
                    <p className="text-sm text-slate-500">by {review.author}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
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
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={!responseText.trim() || respondToReview.isPending}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {respondToReview.isPending ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
