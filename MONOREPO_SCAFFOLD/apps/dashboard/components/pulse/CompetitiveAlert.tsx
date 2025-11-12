'use client'

export function CompetitiveAlert() {
  // TODO: Connect to competitive intelligence API
  const alerts = [
    {
      id: '1',
      type: 'competitor_change',
      message: 'Competitor added new schema markup',
      competitor: 'Rival Dealership',
      timestamp: new Date(),
    },
  ]

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold mb-2">Competitive Alerts</h3>
        <p className="text-sm text-gray-500">No recent market movements</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <h3 className="font-semibold mb-3">Competitive Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="text-sm">
            <div className="font-medium">{alert.message}</div>
            <div className="text-xs text-gray-600 mt-1">
              {alert.competitor} • {alert.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

