'use client';

import DealershipCompareDashboard from '@/components/DealershipCompareDashboard';
import GroupExecutiveSummary from '@/components/GroupExecutiveSummary';
import ForecastReviewDashboard from '@/components/ForecastReviewDashboard';
import ForecastAccuracyLeaderboard from '@/components/ForecastAccuracyLeaderboard';

export default function CompareDashboardPage() {
  return (
    <div className="space-y-10 p-6">
      <DealershipCompareDashboard />
      <GroupExecutiveSummary />
      <ForecastReviewDashboard />
      <ForecastAccuracyLeaderboard />
    </div>
  );
}





