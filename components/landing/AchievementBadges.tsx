'use client';

import { Trophy, Zap, Target, TrendingUp, Award, Star } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface AchievementBadgesProps {
  badges?: Badge[];
  showUnlockedOnly?: boolean;
}

export function AchievementBadges({ badges, showUnlockedOnly = false }: AchievementBadgesProps) {
  const defaultBadges: Badge[] = [
    {
      id: 'first_audit',
      name: 'First Audit Complete',
      description: 'Completed your first AI visibility analysis',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
      unlocked: true,
      unlockedAt: new Date()
    },
    {
      id: 'quick_win',
      name: 'Quick Win Master',
      description: 'Improved your score by 10+ points',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-600',
      unlocked: false
    },
    {
      id: 'top_performer',
      name: 'Top Performer',
      description: 'Ranked in the top 10 dealerships',
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
      unlocked: false
    },
    {
      id: 'consistency',
      name: 'Consistency Champion',
      description: 'Analyzed 10+ times',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
      unlocked: false
    },
    {
      id: 'perfect_score',
      name: 'Perfect Score',
      description: 'Achieved 100/100 AI Visibility Score',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      unlocked: false
    },
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Joined in the first 100 users',
      icon: <Award className="w-6 h-6" />,
      color: 'bg-indigo-100 text-indigo-600',
      unlocked: false
    }
  ];

  const displayBadges = badges || defaultBadges;
  const filteredBadges = showUnlockedOnly
    ? displayBadges.filter(b => b.unlocked)
    : displayBadges;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Achievements</h3>
        <p className="text-gray-600">
          {filteredBadges.filter(b => b.unlocked).length} of {displayBadges.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              badge.unlocked
                ? `${badge.color} border-current shadow-lg`
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`mb-3 ${badge.unlocked ? '' : 'grayscale'}`}>
                {badge.icon}
              </div>
              <h4 className={`font-semibold mb-1 ${badge.unlocked ? '' : 'text-gray-500'}`}>
                {badge.name}
              </h4>
              <p className={`text-xs ${badge.unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                {badge.description}
              </p>
              {badge.unlocked && badge.unlockedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Unlocked {badge.unlockedAt.toLocaleDateString()}
                </p>
              )}
              {!badge.unlocked && (
                <div className="mt-2 text-xs text-gray-400">🔒 Locked</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

