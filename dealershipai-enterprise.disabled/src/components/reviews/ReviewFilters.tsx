'use client'

interface ReviewFiltersProps {
  filters: {
    platform: 'google' | 'facebook' | 'cars' | 'dealerrater' | 'all'
    sentiment: 'positive' | 'neutral' | 'negative' | 'all'
    status: 'pending' | 'responded' | 'all'
  }
  onFiltersChange: (filters: {
    platform: 'google' | 'facebook' | 'cars' | 'dealerrater' | 'all'
    sentiment: 'positive' | 'neutral' | 'negative' | 'all'
    status: 'pending' | 'responded' | 'all'
  }) => void
}

export default function ReviewFilters({ filters, onFiltersChange }: ReviewFiltersProps) {
  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'cars', label: 'Cars.com' },
    { value: 'dealerrater', label: 'DealerRater' }
  ]

  const sentimentOptions = [
    { value: 'all', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: 'pending', label: 'Needs Response' },
    { value: 'responded', label: 'Responded' }
  ]

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value as 'google' | 'facebook' | 'cars' | 'dealerrater' | 'all' | 'positive' | 'neutral' | 'negative' | 'pending' | 'responded'
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Platform
        </label>
        <select
          value={filters.platform}
          onChange={(e) => handleFilterChange('platform', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {platformOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Sentiment
        </label>
        <select
          value={filters.sentiment}
          onChange={(e) => handleFilterChange('sentiment', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {sentimentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
