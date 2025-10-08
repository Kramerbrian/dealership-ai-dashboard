'use client';

import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AuditDashboardProps {
  dealershipId: string;
  website: string;
}

export function AuditDashboard({ dealershipId, website }: AuditDashboardProps) {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Queries
  const { data: dealership } = trpc.dealership.getById.useQuery({ id: dealershipId });
  const { data: auditList, refetch: refetchAudits } = trpc.audit.list.useQuery({
    dealershipId,
    limit: 10
  });
  const { data: scoreHistory } = trpc.audit.getScoreHistory.useQuery({
    dealershipId,
    limit: 30
  });
  const { data: recommendations } = trpc.recommendation.list.useQuery({
    dealershipId,
    status: 'pending'
  });
  const { data: competitorMatrix } = trpc.competitor.getMatrix.useQuery({
    dealershipId
  });

  // Mutations
  const generateAudit = trpc.audit.generate.useMutation({
    onSuccess: async (data) => {
      console.log('✅ Audit complete:', data);
      await refetchAudits();

      // Auto-generate recommendations
      await generateRecommendations.mutateAsync({
        dealershipId,
        auditId: data.audit.id
      });
    },
    onError: (error) => {
      console.error('❌ Audit failed:', error);
    }
  });

  const generateRecommendations = trpc.recommendation.generate.useMutation();

  const handleRunAudit = () => {
    generateAudit.mutate({
      dealershipId,
      website,
      detailed: true
    });
  };

  // Format score history for chart
  const chartData = scoreHistory?.map(score => ({
    date: new Date(score.recorded_at).toLocaleDateString(),
    overall: score.overall_score,
    ai_visibility: score.ai_visibility_score,
    zero_click: score.zero_click_score,
    ugc_health: score.ugc_health_score,
    geo_trust: score.geo_trust_score,
    sgp_integrity: score.sgp_integrity_score,
  })) || [];

  const latestAudit = auditList?.audits[0];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{dealership?.name}</h1>
          <p className="text-gray-600">{website}</p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={generateAudit.isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {generateAudit.isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running Audit...
            </span>
          ) : (
            '🔍 Run AI Audit'
          )}
        </button>
      </div>

      {/* Score Cards */}
      {latestAudit && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <ScoreCard
            title="Overall"
            score={latestAudit.overall_score}
            color="blue"
          />
          <ScoreCard
            title="AI Visibility"
            score={latestAudit.ai_visibility_score}
            color="purple"
          />
          <ScoreCard
            title="Zero-Click"
            score={latestAudit.zero_click_score}
            color="green"
          />
          <ScoreCard
            title="UGC Health"
            score={latestAudit.ugc_health_score}
            color="yellow"
          />
          <ScoreCard
            title="Geo Trust"
            score={latestAudit.geo_trust_score}
            color="orange"
          />
          <ScoreCard
            title="SGP Integrity"
            score={latestAudit.sgp_integrity_score}
            color="red"
          />
        </div>
      )}

      {/* Score Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Score Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="ai_visibility" stroke="#8b5cf6" />
              <Line type="monotone" dataKey="zero_click" stroke="#10b981" />
              <Line type="monotone" dataKey="ugc_health" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="space-y-3">
            {recommendations.slice(0, 5).map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Competitor Matrix */}
      {competitorMatrix && competitorMatrix.matrix.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Competitive Position (#{competitorMatrix.yourRank} of {competitorMatrix.totalCompetitors + 1})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Dealership</th>
                  <th className="text-center p-2">Overall</th>
                  <th className="text-center p-2">AI Visibility</th>
                  <th className="text-center p-2">Zero-Click</th>
                  <th className="text-center p-2">UGC Health</th>
                </tr>
              </thead>
              <tbody>
                {competitorMatrix.matrix.map((dealer, idx) => (
                  <tr
                    key={idx}
                    className={dealer.type === 'yours' ? 'bg-blue-50 font-semibold' : ''}
                  >
                    <td className="p-2">
                      {dealer.name}
                      {dealer.type === 'yours' && ' (You)'}
                    </td>
                    <td className="text-center p-2">
                      <ScoreBadge score={dealer.overall} />
                    </td>
                    <td className="text-center p-2">
                      <ScoreBadge score={dealer.ai_visibility} />
                    </td>
                    <td className="text-center p-2">
                      <ScoreBadge score={dealer.zero_click} />
                    </td>
                    <td className="text-center p-2">
                      <ScoreBadge score={dealer.ugc_health} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function ScoreCard({ title, score, color }: { title: string; score: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
  }[color] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold">{score}</p>
      <div className={`mt-2 inline-block px-2 py-1 rounded text-xs ${colorClasses}`}>
        {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  const bgColor = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  }[color];

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${bgColor}`}>
      {score}
    </span>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  return (
    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{recommendation.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
          Priority {recommendation.priority}
        </span>
      </div>
      <div className="mt-2 flex gap-2 text-xs text-gray-600">
        <span>Impact: {recommendation.impact_score}/10</span>
        <span>•</span>
        <span>Effort: {recommendation.effort_level}/10</span>
        <span>•</span>
        <span>{recommendation.estimated_improvement}</span>
      </div>
    </div>
  );
}
