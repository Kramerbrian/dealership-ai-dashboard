'use client'

import { useState } from 'react'
import { Filter, Search, MessageSquare, Star, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { api } from '@/lib/trpc-client'
import ReviewCard from './ReviewCard'
import ReviewFilters from './ReviewFilters'
import SentimentChart from './SentimentChart'
import BulkResponseModal from './BulkResponseModal'
import MetricCard from '../dashboard/MetricCard'

export default function ReviewDashboard() {
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [filters, setFilters] = useState({
    platform: 'all' as const,
    sentiment: 'all' as const,
    status: 'all' as const
  })

  const { data: reviewsData, isLoading: reviewsLoading } = api.reviews.getReviews.useQuery({
    platform: filters.platform === 'all' ? undefined : filters.platform,
    sentiment: filters.sentiment === 'all' ? undefined : filters.sentiment,
    status: filters.status === 'all' ? undefined : filters.status,
    limit: 50
  })

  const { data: stats } = api.reviews.getReviewStats.useQuery()

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const handleSelectAll = () => {
    if (!reviewsData) return
    
    if (selectedReviews.length === reviewsData.reviews.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(reviewsData.reviews.map(r => r.id))
    }
  }

  const pendingCount = reviewsData?.reviews.filter(r => !r.hasResponse).length || 0
  const avgRating = stats?.averageRating || 0

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Average Rating"
          value={avgRating.toFixed(1)}
          icon={<Star className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Total Reviews"
          value={stats?.totalReviews || 0}
          icon={<MessageSquare className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          title="Pending Response"
          value={pendingCount}
          icon={<AlertCircle className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          title="Response Rate"
          value={`${stats?.responseRate || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Sentiment Chart */}
      {stats && <SentimentChart stats={stats} />}

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search reviews..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
          <div className="flex items-center gap-3">
            {selectedReviews.length > 0 && (
              <button 
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Bulk Respond ({selectedReviews.length})
              </button>
            )}
            <button 
              onClick={handleSelectAll}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {selectedReviews.length === reviewsData?.reviews.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        {showFilters && (
          <ReviewFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          reviewsData?.reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              selected={selectedReviews.includes(review.id)}
              onSelect={() => handleSelectReview(review.id)}
            />
          ))
        )}
      </div>

      {/* Bulk Response Modal */}
      {showBulkModal && (
        <BulkResponseModal
          selectedReviews={selectedReviews}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false)
            setSelectedReviews([])
          }}
        />
      )}
    </div>
  )
}
