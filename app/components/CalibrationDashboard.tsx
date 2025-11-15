'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, CheckCircle, XCircle, DollarSign, MapPin } from 'lucide-react'

interface CalibrationJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  config: {
    city: string
    state: string
    dealerDomains: string[]
    platforms: string[]
  }
  startedAt: string
  completedAt?: string
  results?: any[]
  scores?: any[]
  summary?: {
    totalQueries: number
    successfulQueries: number
    averageConfidence: number
    dealersAnalyzed: number
    platformsUsed: string[]
  }
  error?: string
}

export default function CalibrationDashboard() {
  const [jobs, setJobs] = useState<CalibrationJob[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [newJob, setNewJob] = useState({
    city: 'Naples',
    state: 'FL',
    dealerDomains: ['terryreidsautopark.com', 'napleshonda.com', 'johnstonhyundai.com'],
    platforms: ['chatgpt', 'claude', 'perplexity', 'gemini']
  })

  // Fetch existing jobs
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    // Mock data for demo
    setJobs([
      {
        id: 'cal_naples_1',
        status: 'completed',
        config: {
          city: 'Naples',
          state: 'FL',
          dealerDomains: ['terryreidsautopark.com', 'napleshonda.com'],
          platforms: ['chatgpt', 'claude']
        },
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 1800000).toISOString(),
        summary: {
          totalQueries: 80,
          successfulQueries: 76,
          averageConfidence: 0.87,
          dealersAnalyzed: 2,
          platformsUsed: ['chatgpt', 'claude']
        }
      }
    ])
  }

  const startCalibration = async () => {
    setIsStarting(true)
    try {
      const response = await fetch('/api/ai-calibration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      })
      
      const result = await response.json()
      if ((result as any).success) {
        setNewJob({
          city: 'Naples',
          state: 'FL',
          dealerDomains: ['terryreidsautopark.com', 'napleshonda.com', 'johnstonhyundai.com'],
          platforms: ['chatgpt', 'claude', 'perplexity', 'gemini']
        })
        fetchJobs()
      }
    } catch (error) {
      console.error('Failed to start calibration:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'running':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Visibility Calibration</h2>
            <p className="text-gray-600">Monitor dealership visibility across AI platforms using 40 critical prompts</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Geographic Pooling</div>
            <div className="text-lg font-semibold text-green-600">94% Cost Savings</div>
          </div>
        </div>

        {/* New Calibration Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={newJob.city}
              onChange={(e) => setNewJob({...newJob, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Naples"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={newJob.state}
              onChange={(e) => setNewJob({...newJob, state: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="FL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Domains</label>
            <input
              type="text"
              value={newJob.dealerDomains.join(', ')}
              onChange={(e) => setNewJob({...newJob, dealerDomains: e.target.value.split(', ').filter(d => d.trim())})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="domain1.com, domain2.com"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={startCalibration}
              disabled={isStarting || !newJob.city || !newJob.state || !newJob.dealerDomains.length}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStarting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Calibration
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Est. Cost: $16 per city</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Cost per dealer: $0.53 - $1.07</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Frequency: Bi-weekly</span>
          </div>
        </div>
      </div>

      {/* Calibration Jobs */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Calibration History</h3>
        </div>
        
        <div className="divide-y">
          {jobs.map((job) => (
            <div key={job.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {job.config.city}, {job.config.state}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {job.config.dealerDomains.length} dealers • {job.config.platforms.join(', ')}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                  {job.status}
                </div>
              </div>

              {job.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Total Queries</div>
                    <div className="font-semibold">{job.summary.totalQueries}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Success Rate</div>
                    <div className="font-semibold">
                      {Math.round((job.summary.successfulQueries / job.summary.totalQueries) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Avg Confidence</div>
                    <div className="font-semibold">
                      {Math.round(job.summary.averageConfidence * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Dealers Analyzed</div>
                    <div className="font-semibold">{job.summary.dealersAnalyzed}</div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Started: {new Date(job.startedAt).toLocaleString()}
                {job.completedAt && (
                  <> • Completed: {new Date(job.completedAt).toLocaleString()}</>
                )}
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No calibration jobs yet. Start your first calibration above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
