"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Types
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'seo' | 'traffic' | 'revenue' | 'engagement' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    metric: string;
    threshold: number;
    timeframe: string;
  };
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  achievements: number;
  level: number;
  department: string;
  badges: string[];
  weeklyChange: number;
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  experienceToNext: number;
  totalScore: number;
  achievements: Achievement[];
  badges: string[];
  streak: number;
  department: string;
  joinDate: Date;
}

interface GamificationStats {
  totalUsers: number;
  activeUsers: number;
  totalAchievements: number;
  averageLevel: number;
  topAchievement: string;
  weeklyActivity: number;
}

const GamificationSystem = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'leaderboard' | 'stats'>('profile');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    setIsLoading(true);
    try {
      // Mock data
      const mockUserProfile: UserProfile = {
        id: '1',
        name: 'Brian Kramer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        level: 12,
        experience: 2450,
        experienceToNext: 550,
        totalScore: 15420,
        achievements: [],
        badges: ['early-adopter', 'seo-master', 'traffic-champion'],
        streak: 7,
        department: 'Marketing',
        joinDate: new Date('2024-01-15')
      };

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'SEO Master',
          description: 'Achieve 90% SEO score for 30 consecutive days',
          icon: '🏆',
          category: 'seo',
          rarity: 'epic',
          points: 500,
          requirements: { metric: 'seo_score', threshold: 90, timeframe: '30 days' },
          unlocked: true,
          unlockedAt: new Date('2024-02-15'),
          progress: 100
        },
        {
          id: '2',
          name: 'Traffic Surge',
          description: 'Increase monthly traffic by 50%',
          icon: '📈',
          category: 'traffic',
          rarity: 'rare',
          points: 300,
          requirements: { metric: 'traffic_growth', threshold: 50, timeframe: '1 month' },
          unlocked: true,
          unlockedAt: new Date('2024-03-01'),
          progress: 100
        },
        {
          id: '3',
          name: 'Revenue Rockstar',
          description: 'Generate $100K in monthly revenue',
          icon: '💰',
          category: 'revenue',
          rarity: 'legendary',
          points: 1000,
          requirements: { metric: 'monthly_revenue', threshold: 100000, timeframe: '1 month' },
          unlocked: false,
          progress: 75
        },
        {
          id: '4',
          name: 'Engagement Expert',
          description: 'Maintain 80% engagement rate for 2 weeks',
          icon: '💬',
          category: 'engagement',
          rarity: 'uncommon',
          points: 200,
          requirements: { metric: 'engagement_rate', threshold: 80, timeframe: '2 weeks' },
          unlocked: false,
          progress: 60
        },
        {
          id: '5',
          name: 'First Steps',
          description: 'Complete your first dashboard setup',
          icon: '🎯',
          category: 'milestone',
          rarity: 'common',
          points: 50,
          requirements: { metric: 'dashboard_setup', threshold: 1, timeframe: '1 day' },
          unlocked: true,
          unlockedAt: new Date('2024-01-15'),
          progress: 100
        }
      ];

      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          score: 18500,
          rank: 1,
          achievements: 8,
          level: 15,
          department: 'Sales',
          badges: ['revenue-champion', 'customer-hero', 'team-player'],
          weeklyChange: 12
        },
        {
          id: '2',
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          score: 17200,
          rank: 2,
          achievements: 7,
          level: 14,
          department: 'Marketing',
          badges: ['seo-master', 'content-king', 'analytics-guru'],
          weeklyChange: 8
        },
        {
          id: '3',
          name: 'Brian Kramer',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          score: 15420,
          rank: 3,
          achievements: 6,
          level: 12,
          department: 'Marketing',
          badges: ['early-adopter', 'seo-master', 'traffic-champion'],
          weeklyChange: 15
        },
        {
          id: '4',
          name: 'Emily Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          score: 14200,
          rank: 4,
          achievements: 5,
          level: 11,
          department: 'Operations',
          badges: ['efficiency-expert', 'process-master'],
          weeklyChange: -3
        },
        {
          id: '5',
          name: 'David Kim',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          score: 13800,
          rank: 5,
          achievements: 5,
          level: 11,
          department: 'Development',
          badges: ['tech-innovator', 'bug-hunter'],
          weeklyChange: 6
        }
      ];

      const mockStats: GamificationStats = {
        totalUsers: 45,
        activeUsers: 38,
        totalAchievements: 23,
        averageLevel: 9.2,
        topAchievement: 'Revenue Rockstar',
        weeklyActivity: 87
      };

      setUserProfile(mockUserProfile);
      setAchievements(mockAchievements);
      setLeaderboard(mockLeaderboard);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'uncommon': return 'from-green-400 to-green-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'epic': return 'from-purple-400 to-purple-500';
      case 'legendary': return 'from-yellow-400 to-yellow-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const renderUserProfile = () => (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={userProfile?.avatar} alt={userProfile?.name} />
          <div className="level-badge">Level {userProfile?.level}</div>
        </div>
        <div className="profile-info">
          <h2>{userProfile?.name}</h2>
          <p className="department">{userProfile?.department}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{userProfile?.totalScore.toLocaleString()}</span>
              <span className="stat-label">Total Score</span>
            </div>
            <div className="stat">
              <span className="stat-value">{userProfile?.achievements.length}</span>
              <span className="stat-label">Achievements</span>
            </div>
            <div className="stat">
              <span className="stat-value">{userProfile?.streak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="experience-bar">
        <div className="exp-label">
          <span>Experience</span>
          <span>{userProfile?.experience} / {userProfile?.experience + userProfile?.experienceToNext}</span>
        </div>
        <div className="exp-bar">
          <div 
            className="exp-fill"
            style={{ width: `${(userProfile?.experience / (userProfile?.experience + userProfile?.experienceToNext)) * 100}%` }}
          ></div>
        </div>
        <div className="exp-next">
          {userProfile?.experienceToNext} XP to next level
        </div>
      </div>

      <div className="badges-section">
        <h3>Badges</h3>
        <div className="badges-grid">
          {userProfile?.badges.map((badge, index) => (
            <div key={index} className="badge">
              <div className="badge-icon">🏅</div>
              <span className="badge-name">{badge.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="achievements">
      <div className="achievements-header">
        <h3>Achievements</h3>
        <div className="achievement-stats">
          <span>{achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked</span>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">
              <span style={{ fontSize: '2rem' }}>{achievement.icon}</span>
            </div>
            <div className="achievement-content">
              <div className="achievement-header">
                <h4>{achievement.name}</h4>
                <span 
                  className="rarity-badge"
                  style={{ backgroundColor: getRarityColor(achievement.rarity) }}
                >
                  {achievement.rarity}
                </span>
              </div>
              <p className="achievement-description">{achievement.description}</p>
              <div className="achievement-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{achievement.progress}%</span>
              </div>
              <div className="achievement-points">{achievement.points} points</div>
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="unlocked-date">
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <div className="leaderboard-stats">
          <span>{leaderboard.length} players</span>
        </div>
      </div>

      <div className="leaderboard-list">
        {leaderboard.map(entry => (
          <div key={entry.id} className={`leaderboard-entry ${entry.id === userProfile?.id ? 'current-user' : ''}`}>
            <div className="rank">
              <span className="rank-number">#{entry.rank}</span>
            </div>
            <div className="player-info">
              <img src={entry.avatar} alt={entry.name} className="player-avatar" />
              <div className="player-details">
                <h4>{entry.name}</h4>
                <p className="department">{entry.department}</p>
                <div className="player-badges">
                  {entry.badges.slice(0, 3).map((badge, index) => (
                    <span key={index} className="player-badge">
                      {badge.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="player-stats">
              <div className="score">{entry.score.toLocaleString()}</div>
              <div className="level">Level {entry.level}</div>
              <div className="achievements">{entry.achievements} achievements</div>
            </div>
            <div className="weekly-change">
              <span className={`change ${entry.weeklyChange >= 0 ? 'positive' : 'negative'}`}>
                {entry.weeklyChange >= 0 ? '+' : ''}{entry.weeklyChange}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="gamification-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalAchievements}</div>
            <div className="stat-label">Total Achievements</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.averageLevel}</div>
            <div className="stat-label">Average Level</div>
          </div>
        </div>
      </div>

      <div className="activity-chart">
        <h4>Weekly Activity</h4>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { week: 'Week 1', activity: 65 },
              { week: 'Week 2', activity: 78 },
              { week: 'Week 3', activity: 82 },
              { week: 'Week 4', activity: 87 },
              { week: 'This Week', activity: 92 }
            ]}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activity" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="gamification-loading">
        <div className="loading-spinner"></div>
        <p>Loading gamification data...</p>
      </div>
    );
  }

  return (
    <div className="gamification-system">
      <div className="gamification-header">
        <h2>🎮 Gamification & Leaderboards</h2>
        <p>Compete, achieve, and level up your dealership performance</p>
      </div>

      <div className="gamification-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button 
          className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      <div className="gamification-content">
        {activeTab === 'profile' && renderUserProfile()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'stats' && renderStats()}
      </div>
    </div>
  );
};

export default GamificationSystem;
