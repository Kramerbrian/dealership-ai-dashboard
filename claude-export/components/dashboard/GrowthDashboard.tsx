/**
 * DealershipAI Growth Dashboard
 * Showcases all growth engine features in one comprehensive view
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Share2, 
  Target, 
  Zap, 
  Award, 
  BarChart3,
  Brain,
  Command,
  Mail,
  Gamepad2,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface GrowthMetrics {
  kFactor: number;
  sharesPerUser: number;
  conversionRate: number;
  totalShares: number;
  activeUsers: number;
  newSignups: number;
  revenueAtRisk: number;
  aiVisibility: number;
  rank: number;
  quickWins: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  progress: number;
}

interface ViralReport {
  dealership: string;
  scores: {
    aiVisibility: number;
    rank: number;
    marketTotal: number;
    percentile: number;
  };
  competitors: Array<{
    name: string;
    score: number;
    gap: number;
    weakness: string;
  }>;
  opportunities: {
    monthlyRevenue: number;
    quickWins: number;
    estimatedTimeToFix: string;
  };
}

export const GrowthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [viralReport, setViralReport] = useState<ViralReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrowthData();
  }, []);

  const loadGrowthData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        kFactor: 1.4,
        sharesPerUser: 0.8,
        conversionRate: 0.25,
        totalShares: 45,
        activeUsers: 150,
        newSignups: 38,
        revenueAtRisk: 18000,
        aiVisibility: 87.3,
        rank: 2,
        quickWins: 3
      });

      setAchievements([
        {
          id: 'first_audit',
          name: 'Getting Started',
          description: 'Complete your first AI visibility audit',
          icon: '🎯',
          rarity: 'common',
          points: 10,
          unlocked: true,
          progress: 100
        },
        {
          id: 'score_75',
          name: 'Top Tier',
          description: 'Reach 75 AI Visibility Score',
          icon: '🏆',
          rarity: 'rare',
          points: 50,
          unlocked: true,
          progress: 100
        },
        {
          id: 'beat_rival',
          name: 'Dethroned',
          description: 'Overtake your main competitor',
          icon: '⚡',
          rarity: 'rare',
          points: 75,
          unlocked: false,
          progress: 60
        }
      ]);

      setViralReport({
        dealership: 'Demo Dealership',
        scores: {
          aiVisibility: 87.3,
          rank: 2,
          marketTotal: 12,
          percentile: 83
        },
        competitors: [
          { name: 'Competitor A', score: 92.1, gap: -4.8, weakness: 'Poor content quality' },
          { name: 'Competitor B', score: 78.5, gap: 8.8, weakness: 'Weak schema implementation' },
          { name: 'Competitor C', score: 85.2, gap: 2.1, weakness: 'Low review count' }
        ],
        opportunities: {
          monthlyRevenue: 12300,
          quickWins: 3,
          estimatedTimeToFix: '2-3 weeks'
        }
      });
    } catch (error) {
      console.error('Failed to load growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number, target: number) => {
    if (value > target) return <ArrowUp className="text-green-500" size={16} />;
    if (value < target) return <ArrowDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-500" size={16} />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Growth Engine</h1>
          <p className="text-gray-600 mt-2">Viral loops, automation, and advanced analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            K-Factor: {metrics?.kFactor || 0}
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Profitable Virality
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">K-Factor</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.kFactor || 0}</p>
              <p className="text-xs text-gray-500">Target: 1.4+</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          {getTrendIcon(metrics?.kFactor || 0, 1.4)}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shares per User</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.sharesPerUser || 0}</p>
              <p className="text-xs text-gray-500">Target: 0.8+</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Share2 className="text-blue-600" size={24} />
            </div>
          </div>
          {getTrendIcon(metrics?.sharesPerUser || 0, 0.8)}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round((metrics?.conversionRate || 0) * 100)}%</p>
              <p className="text-xs text-gray-500">Target: 25%+</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="text-purple-600" size={24} />
            </div>
          </div>
          {getTrendIcon((metrics?.conversionRate || 0) * 100, 25)}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue at Risk</p>
              <p className="text-2xl font-bold text-gray-900">${(metrics?.revenueAtRisk || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Monthly opportunity</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Zap className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Growth Engine Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Viral Growth */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Share2 className="text-green-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Viral Growth Engine</h3>
          </div>
          
          {viralReport && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">
                  {viralReport.scores.aiVisibility}
                  <span className="text-lg text-gray-500">/100</span>
                </div>
                <div className="text-sm text-gray-600">
                  #{viralReport.scores.rank} of {viralReport.scores.marketTotal} dealers
                </div>
                <div className="text-xs text-gray-500">
                  Top {viralReport.scores.percentile}% in your market
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Competitive Position</h4>
                <div className="space-y-2">
                  {viralReport.competitors.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{comp.name}</div>
                        <div className="text-xs text-gray-500">{comp.weakness}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${comp.gap > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comp.gap > 0 ? '+' : ''}{comp.gap} pts
                        </div>
                        <div className="text-xs text-gray-500">{comp.score}/100</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm font-medium">
                  Generate Shareable Report
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  View Analytics
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gamification */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gamepad2 className="text-purple-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Gamification System</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Level 2</div>
                <div className="text-sm text-gray-600">150 points</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Next: 200 points</div>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Achievements</h4>
              <div className="space-y-2">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{achievement.name}</div>
                      <div className="text-xs text-gray-500">{achievement.description}</div>
                    </div>
                    <div className={`text-sm font-medium ${getRarityColor(achievement.rarity)}`}>
                      {achievement.points} pts
                    </div>
                    {achievement.unlocked ? (
                      <div className="text-green-600 text-sm">✓</div>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        {achievement.progress}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                View Leaderboard
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                Active Quests
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Command Palette */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Command className="text-blue-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Command Palette</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘K</kbd> for instant navigation and actions
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Brain className="text-gray-400" size={16} />
              <span>AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="text-gray-400" size={16} />
              <span>Competitor Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="text-gray-400" size={16} />
              <span>Quick Wins</span>
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="text-green-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Chat Assistant</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Context-aware AI that helps with optimization and strategy
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Schema optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Competitor insights</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Quick fixes</span>
            </div>
          </div>
        </div>

        {/* Marketing Automation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Mail className="text-orange-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Marketing Automation</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Intelligent email sequences and notification system
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Onboarding flow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Churn prevention</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Upgrade nudges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="text-indigo-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Growth Analytics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics?.totalShares || 0}</div>
            <div className="text-sm text-gray-600">Total Shares</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics?.activeUsers || 0}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics?.newSignups || 0}</div>
            <div className="text-sm text-gray-600">New Signups</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{metrics?.quickWins || 0}</div>
            <div className="text-sm text-gray-600">Quick Wins</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthDashboard;