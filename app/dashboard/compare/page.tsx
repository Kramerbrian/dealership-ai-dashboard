'use client';

import DealershipCompareDashboard from '@/components/DealershipCompareDashboard';
import GroupExecutiveSummary from '@/components/GroupExecutiveSummary';
import ForecastReviewDashboard from '@/components/ForecastReviewDashboard';
import ForecastAccuracyLeaderboard from '@/components/ForecastAccuracyLeaderboard';
import ForecastAccuracyTracker from '@/components/ForecastAccuracyTracker';
import ScenarioPlanningTool from '@/components/ScenarioPlanningTool';
import SubmitActualScores from '@/components/SubmitActualScores';
import DLOCCalculator from '@/components/analytics/DLOCCalculator';
import OrchestratorStatus from '@/components/orchestrator/OrchestratorStatus';

export default function CompareDashboardPage() {
  return (
    <div className="space-y-10 p-6">
      <DealershipCompareDashboard />
      <GroupExecutiveSummary />
      <ForecastReviewDashboard />
      <ScenarioPlanningTool />
      <SubmitActualScores />
      <ForecastAccuracyTracker />
      <ForecastAccuracyLeaderboard />
      <DLOCCalculator />
      <OrchestratorStatus />
    </div>
  );
}





