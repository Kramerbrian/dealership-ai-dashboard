import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import CompetitorMatrix from '@/components/dashboard/CompetitorMatrix';
import AIVisibilityChart from '@/components/dashboard/AIVisibilityChart';
import ActionQueue from '@/components/dashboard/ActionQueue';
import { Target, TrendingUp, Star, Users } from 'lucide-react';

interface DashboardPageProps {
  params: {
    dealerId: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { dealerId } = params;
  
  // In production, fetch dealer info from database
  const dealerInfo = {
    id: dealerId,
    name: `Dealer ${dealerId}`,
  };

  return (
    <DashboardLayout dealerName={dealerInfo.name} dealerId={dealerInfo.id}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {dealerInfo.name} Dashboard
        </h1>
        <p className="text-slate-600">Performance metrics and insights for this dealership</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="AI Visibility Score"
          value={72}
          change={8}
          trend="up"
          subtitle="vs last week"
          icon={<Target className="w-6 h-6" />}
          color="emerald"
        />
        <MetricCard
          title="Review Health"
          value={4.6}
          change={0.3}
          trend="up"
          subtitle="128 total reviews"
          icon={<Star className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Local Rank"
          value="#3"
          trend="neutral"
          subtitle="in Naples, FL"
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
        />
        <MetricCard
          title="Monthly Leads"
          value={47}
          change={12}
          trend="up"
          subtitle="from AI channels"
          icon={<Users className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AIVisibilityChart />
        <ActionQueue />
      </div>

      {/* Competitor Matrix */}
      <CompetitorMatrix />
    </DashboardLayout>
  );
}
