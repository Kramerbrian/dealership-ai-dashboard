'use client';

import DealershipCompareDashboard from '@/components/DealershipCompareDashboard';
import GroupExecutiveSummary from '@/components/GroupExecutiveSummary';
import ForecastReviewDashboard from '@/components/ForecastReviewDashboard';
import ForecastAccuracyLeaderboard from '@/components/ForecastAccuracyLeaderboard';
import DLOCCalculator from '@/components/analytics/DLOCCalculator';

export default function CompareDashboardPage() {
  return (
    <div className="space-y-10 p-6">
      <DealershipCompareDashboard />
      <GroupExecutiveSummary />
      <ForecastReviewDashboard />
      <ForecastAccuracyLeaderboard />
      <DLOCCalculator />
    </div>
  );
}





