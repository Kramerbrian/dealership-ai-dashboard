'use client'
import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, TrendingUp, Eye, Target } from 'lucide-react'

interface GeoAuditResult {
  overallScore: number
  structuredData: number
  entityClarity: number
  contentFreshness: number
  trustSignals: number
  aiVisibility: number
  recommendations: string[]
}

export default function GeoAuditCard() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<GeoAuditResult | null>(null)

  const runGeoAudit = async () => {
    setIsRunning(true)
    
    // Simulate audit process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock results based on the GEO strategy
    const mockResults: GeoAuditResult = {
      overallScore: 42,
      structuredData: 35,
      entityClarity: 58,
      contentFreshness: 28,
      trustSignals: 45,
      aiVisibility: 15,
      recommendations: [
        'Implement JSON-LD structured data for vehicles and reviews',
        'Add FAQ schema for common customer questions',
        'Optimize entity markup for business information',
        'Increase content update frequency to 2x per week',
        'Respond to reviews within 24 hours',
        'Create AI-friendly comparison content'
      ]
    }
    
    setResults(mockResults)
    setIsRunning(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400 bg-green-500/20'
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-4 h-4" />
    if (score >= 50) return <AlertTriangle className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border border-slate-700/50 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">GEO Audit</h3>
          <p className="text-slate-300 text-sm">Generative Engine Optimization Analysis</p>
        </div>
        <button
          onClick={runGeoAudit}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Run Audit
            </>
          )}
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-2xl font-bold ${getScoreColor(results.overallScore)}`}>
              {getScoreIcon(results.overallScore)}
              {results.overallScore}/100
            </div>
            <p className="text-slate-300 text-sm mt-2">Overall GEO Score</p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <ScoreItem
              label="Structured Data"
              score={results.structuredData}
              icon={<Target className="w-4 h-4" />}
            />
            <ScoreItem
              label="Entity Clarity"
              score={results.entityClarity}
              icon={<Eye className="w-4 h-4" />}
            />
            <ScoreItem
              label="Content Freshness"
              score={results.contentFreshness}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <ScoreItem
              label="Trust Signals"
              score={results.trustSignals}
              icon={<CheckCircle className="w-4 h-4" />}
            />
          </div>

          {/* AI Visibility Impact */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">AI Visibility Risk</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{results.aiVisibility}%</div>
            <p className="text-slate-300 text-xs">
              Current AI answer visibility. Target: 70%+ to prevent traffic siphon.
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Priority Recommendations</h4>
            <div className="space-y-2">
              {results.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!results && !isRunning && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            Run a GEO audit to analyze your AI search visibility and identify optimization opportunities.
          </p>
        </div>
      )}
    </div>
  )
}

function ScoreItem({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-300">{label}</span>
      </div>
      <div className={`text-lg font-bold ${getScoreColor(score)}`}>
        {score}/100
      </div>
    </div>
  )
}
