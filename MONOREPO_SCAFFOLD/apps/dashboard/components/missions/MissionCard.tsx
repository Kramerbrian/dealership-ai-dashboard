'use client'

import type { Mission } from '@dealershipai/shared'

interface MissionCardProps {
  mission: Mission
  onClick: () => void
}

export function MissionCard({ mission, onClick }: MissionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'queued':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-green-600'
    if (confidence >= 0.70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{mission.agentId}</h3>
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(mission.status)}`}>
          {mission.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Confidence</span>
          <span className={`font-semibold ${getConfidenceColor(mission.confidence)}`}>
            {(mission.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Scan</span>
          <span>→</span>
          <span>Diagnose</span>
          <span>→</span>
          <span>Prescribe</span>
          <span>→</span>
          <span>Deploy</span>
          <span>→</span>
          <span>Validate</span>
        </div>

        {mission.evidence && Array.isArray(mission.evidence) && (
          <div className="text-xs text-gray-500">
            {mission.evidence.length} evidence items
          </div>
        )}
      </div>
    </div>
  )
}

