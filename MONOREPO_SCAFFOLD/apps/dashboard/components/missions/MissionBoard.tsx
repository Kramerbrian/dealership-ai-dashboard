'use client'

import { useState, useEffect } from 'react'
import { MissionCard } from './MissionCard'
import { EvidencePanel } from './EvidencePanel'
import type { Mission } from '@dealershipai/shared'

export function MissionBoard() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [filter, setFilter] = useState<'all' | 'quick_win' | 'strategic' | 'maintenance'>('all')

  useEffect(() => {
    // Fetch missions
    fetch('/api/missions')
      .then((res) => res.json())
      .then((data) => setMissions(data.missions || []))
      .catch(console.error)
  }, [])

  const filteredMissions = missions.filter(
    (mission) => filter === 'all' || mission.category === filter
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Mission Board</h2>
        <div className="flex gap-2">
          {(['all', 'quick_win', 'strategic', 'maintenance'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onClick={() => setSelectedMission(mission)}
          />
        ))}
      </div>

      {selectedMission && (
        <EvidencePanel
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  )
}

