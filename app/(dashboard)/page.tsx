import { ScoreCard } from '@/components/ui/ScoreCard';
import { EngineBadge } from '@/components/ui/EngineBadge';
import { SourceBreakdown } from '@/components/ui/SourceBreakdown';
import { ComparisonTable } from '@/components/ui/ComparisonTable';
import { DealerQueryExplorer } from '@/components/dashboard/DealerQueryExplorer';

export default function DashboardPage() {
  // Mock data - replace with real data from API
  const mockQueries = [
    { query: "best Toyota dealer near me", volume: 12400, trend: 'up' as const, trendValue: 12, category: 'research' as const, brand: 'Toyota' },
    { query: "should I buy used or new car", volume: 8900, trend: 'down' as const, trendValue: 5, category: 'comparison' as const },
    { query: "Honda dealer with best financing", volume: 6200, trend: 'up' as const, trendValue: 18, category: 'purchase' as const, brand: 'Honda' },
    { query: "BMW service center reviews", volume: 4800, trend: 'neutral' as const, trendValue: 2, category: 'service' as const, brand: 'BMW' },
    { query: "Ford dealer inventory", volume: 3600, trend: 'up' as const, trendValue: 8, category: 'research' as const, brand: 'Ford' },
  ];

  const mockSources = [
    { name: 'Google Reviews', share: 45, color: 'blue' as const },
    { name: 'Yelp', share: 32, color: 'red' as const },
    { name: 'DealerRater', share: 18, color: 'orange' as const },
    { name: 'Your Website', share: 5, color: 'green' as const },
  ];

  const mockComparison = [
    { metric: 'AI Visibility Score', you: 42, competitor: 64, avg: 68 },
    { metric: 'Monthly Mentions', you: 247, competitor: 489, avg: 312 },
    { metric: 'Average Rank', you: 3.2, competitor: 1.8, avg: 2.4 },
    { metric: 'Positive Sentiment', you: 87, competitor: 92, avg: 89 },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">AI Visibility Dashboard</h1>
              <p className="text-gray-400 mt-2">Track visibility across 6 AI engines with real-time scoring</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/automation"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Automation Center
              </a>
            </div>
          </div>
        </div>
        
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ScoreCard
            title="AI Visibility Score"
            score={42}
            status="critical"
            trend={{ value: 8, direction: 'up' }}
            benchmark={{ label: 'Industry avg', value: 68 }}
          />
          <ScoreCard
            title="ChatGPT Rank"
            score={3}
            outOf={10}
            status="warning"
            trend={{ value: 2, direction: 'up' }}
          />
          <ScoreCard
            title="Monthly Mentions"
            score={247}
            status="good"
            trend={{ value: 12, direction: 'up' }}
          />
          <ScoreCard
            title="Positive Sentiment"
            score={87}
            status="excellent"
            trend={{ value: 5, direction: 'up' }}
          />
        </div>

        {/* AI Engine Tracking */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">AI Engine Performance</h2>
          <div className="flex flex-wrap gap-3">
            <EngineBadge engine="ChatGPT" rank={3} mentions={247} color="green" />
            <EngineBadge engine="Claude" rank={5} mentions={89} color="blue" />
            <EngineBadge engine="Perplexity" rank={2} mentions={156} color="purple" />
            <EngineBadge engine="Copilot" rank={4} mentions={78} color="orange" />
            <EngineBadge engine="Gemini" rank={6} mentions={45} color="red" />
            <EngineBadge engine="Grok" rank={7} mentions={23} color="gray" />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SourceBreakdown sources={mockSources} />
          <ComparisonTable
            columns={['Metric', 'You', 'Top Competitor', 'Industry Avg']}
            rows={mockComparison}
          />
        </div>

        {/* Query Explorer */}
        <DealerQueryExplorer queries={mockQueries} />
      </div>
    </div>
  );
}