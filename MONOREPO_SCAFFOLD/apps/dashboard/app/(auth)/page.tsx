import { InsightsFeed } from '@/components/pulse/InsightsFeed'
import { MetricCard } from '@/components/pulse/MetricCard'
import { CompetitiveAlert } from '@/components/pulse/CompetitiveAlert'
import { ActionStack } from '@/components/pulse/ActionStack'
import { MissionBoard } from '@/components/missions/MissionBoard'
import { HALChat } from '@/components/orchestrator/HALChat'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard metric="aiv" />
        <MetricCard metric="qai" />
        <MetricCard metric="piqr" />
        <MetricCard metric="oci" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MissionBoard />
        </div>
        <div className="space-y-6">
          <InsightsFeed />
          <CompetitiveAlert />
          <ActionStack />
        </div>
      </div>

      <HALChat />
    </div>
  )
}

