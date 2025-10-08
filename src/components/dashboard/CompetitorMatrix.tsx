'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  aiVisibility: number;
  reviews: number;
  seoScore: number;
  trend: 'up' | 'down' | 'neutral';
}

export default function CompetitorMatrix() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/competitor-matrix');
      const data = await res.json();
      setCompetitors(data.competitors);
    } catch (error) {
      console.error('Failed to fetch competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Competitive Matrix</h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          {showAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showAll ? 'Hide Details' : 'Show All'}
        </button>
      </div>

      <div className="space-y-3">
        {competitors.map((comp) => (
          <div
            key={comp.id}
            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg flex items-center justify-center text-white font-semibold">
                  {comp.name[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{comp.name}</h4>
                  <p className="text-xs text-slate-500">Updated 2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(comp.aiVisibility)}`}>
                  {comp.aiVisibility}
                </span>
                {comp.trend === 'up' && (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>

            {showAll && (
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 mb-1">AI Visibility</p>
                  <p className="text-sm font-semibold">{comp.aiVisibility}/100</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Reviews</p>
                  <p className="text-sm font-semibold">{comp.reviews}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">SEO Score</p>
                  <p className="text-sm font-semibold">{comp.seoScore}/100</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
