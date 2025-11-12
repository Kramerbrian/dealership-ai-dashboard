'use client'

import { X } from 'lucide-react'
import type { Mission } from '@dealershipai/shared'

interface EvidencePanelProps {
  mission: Mission
  onClose: () => void
}

export function EvidencePanel({ mission, onClose }: EvidencePanelProps) {
  const evidence = mission.evidence || []

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end">
      <div className="w-full max-w-2xl h-full bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Evidence Trail</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            Mission: {mission.agentId} | Status: {mission.status}
          </div>

          {evidence.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No evidence collected yet
            </div>
          ) : (
            <div className="space-y-4">
              {evidence.map((item: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium">{item.type || 'Evidence'}</div>
                    <div className="text-xs text-gray-500">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleString()
                        : 'Unknown'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.description || JSON.stringify(item, null, 2)}
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      View source →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

