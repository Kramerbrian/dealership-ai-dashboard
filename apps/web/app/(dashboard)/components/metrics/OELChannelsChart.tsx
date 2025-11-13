'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'
import { useOELChannels, type ChannelRow } from '@/app/(dashboard)/hooks/useOELChannels'

interface OELChannelsChartProps {
  domain: string
  channels?: string[]
}

export function OELChannelsChart({ domain, channels }: OELChannelsChartProps) {
  const { data, loading, error } = useOELChannels(domain, channels)

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">Loading channel data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg border border-red-200 bg-red-50">
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!data || !data.channels.length) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">No channel data available</div>
      </div>
    )
  }

  const chartData = data.channels.map((channel) => ({
    name: channel.name,
    'Wasted Spend': Math.round(channel.wastedSpend),
    'Lost Leads Value': Math.round(channel.lostLeadsValue),
    'OEL': Math.round(channel.oel),
    'Recovered': Math.round(channel.recovered),
    efficiencyScore: channel.efficiencyScore,
  }))

  const getEfficiencyColor = (score: number) => {
    if (score >= 70) return '#10b981' // green
    if (score >= 50) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">OEL by Channel</h3>
        <p className="text-sm text-gray-600">
          Average Efficiency Score: <span className="font-semibold">{data.avgEfficiencyScore}/100</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Total OEL: ${data.totals.oel.toLocaleString()} | Recovered: ${data.totals.recovered.toLocaleString()}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name,
            ]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Wasted Spend" fill="#ef4444" />
          <Bar dataKey="Lost Leads Value" fill="#f59e0b" />
          <Bar dataKey="Recovered" fill="#10b981" />
          <Bar dataKey="OEL" fill="#8b5cf6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getEfficiencyColor(entry.efficiencyScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {data.channels.map((channel) => (
          <div
            key={channel.name}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="font-medium text-gray-900">{channel.name}</div>
            <div className="text-xs text-gray-600 mt-1">
              OEL: ${Math.round(channel.oel).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">
              Efficiency: <span className="font-semibold">{channel.efficiencyScore}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

