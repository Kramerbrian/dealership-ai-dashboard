/**
 * DealershipAI Gamification Engine
 * Achievement system, leaderboards, and quest system
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  progress: number; // 0-100
  requirement: string;
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  rank: number;
  dealership: string;
  score: number;
  change: number; // Position change from last week
  badge?: string;
  city: string;
  state: string;
  userId: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  steps: QuestStep[];
  rewards: {
    points: number;
    badge?: string;
    feature_unlock?: string;
  };
  progress: number; // 0-100
  completed: boolean;
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: string; // What they need to do
  help_link?: string;
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  completedQuests: string[];
  currentQuests: Quest[];
  streak: number; // Days in a row
  lastActive: Date;
}

export class GamificationEngine {
  private baseUrl: string;
  private analytics: any;

  constructor(baseUrl: string = 'https://dealershipai.com') {
    this.baseUrl = baseUrl;
    this.analytics = null; // Initialize with your analytics service
  }

  /**
   * Achievement system with dopamine-driven unlocks
   */
  achievements: Achievement[] = [
    // Early wins (high unlock rate)
    {
      id: 'first_audit',
      name: 'Getting Started',
      description: 'Complete your first AI visibility audit',
      icon: '🎯',
      rarity: 'common',
      points: 10,
      unlocked: false,
      progress: 0,
      requirement: 'Complete 1 audit'
    },
    {
      id: 'competitor_added',
      name: 'Know Thy Enemy',
      description: 'Add your first competitor',
      icon: '⚔️',
      rarity: 'common',
      points: 15,
      unlocked: false,
      progress: 0,
      requirement: 'Track 1 competitor'
    },
    
    // Progress milestones
    {
      id: 'score_50',
      name: 'Half Century',
      description: 'Reach 50 AI Visibility Score',
      icon: '📊',
      rarity: 'common',
      points: 25,
      unlocked: false,
      progress: 0,
      requirement: 'AI Score ≥ 50'
    },
    {
      id: 'score_75',
      name: 'Top Tier',
      description: 'Reach 75 AI Visibility Score',
      icon: '🏆',
      rarity: 'rare',
      points: 50,
      unlocked: false,
      progress: 0,
      requirement: 'AI Score ≥ 75'
    },
    {
      id: 'score_90',
      name: 'Elite Status',
      description: 'Reach 90 AI Visibility Score',
      icon: '👑',
      rarity: 'epic',
      points: 100,
      unlocked: false,
      progress: 0,
      requirement: 'AI Score ≥ 90'
    },
    
    // Competitive achievements
    {
      id: 'beat_rival',
      name: 'Dethroned',
      description: 'Overtake your main competitor',
      icon: '⚡',
      rarity: 'rare',
      points: 75,
      unlocked: false,
      progress: 0,
      requirement: 'Score > rival.score'
    },
    {
      id: 'market_leader',
      name: 'Market Domination',
      description: 'Rank #1 in your city',
      icon: '🌟',
      rarity: 'epic',
      points: 150,
      unlocked: false,
      progress: 0,
      requirement: 'Rank === 1'
    },
    
    // Engagement achievements
    {
      id: 'seven_day_streak',
      name: 'Consistent',
      description: 'Log in 7 days in a row',
      icon: '🔥',
      rarity: 'common',
      points: 30,
      unlocked: false,
      progress: 0,
      requirement: 'Login streak ≥ 7'
    },
    {
      id: 'monthly_streak',
      name: 'Dedication',
      description: 'Log in 30 days in a row',
      icon: '💪',
      rarity: 'rare',
      points: 100,
      unlocked: false,
      progress: 0,
      requirement: 'Login streak ≥ 30'
    },
    
    // Social achievements
    {
      id: 'first_share',
      name: 'Spreading the Word',
      description: 'Share your first victory',
      icon: '📢',
      rarity: 'common',
      points: 20,
      unlocked: false,
      progress: 0,
      requirement: 'Share 1 achievement'
    },
    {
      id: 'referral',
      name: 'Team Player',
      description: 'Refer another dealership',
      icon: '🤝',
      rarity: 'rare',
      points: 50,
      unlocked: false,
      progress: 0,
      requirement: 'Successful referral'
    },
    
    // Hidden achievements (discovery = delight)
    {
      id: 'night_owl',
      name: 'Burning the Midnight Oil',
      description: 'Log in at 2am',
      icon: '🦉',
      rarity: 'rare',
      points: 25,
      unlocked: false,
      progress: 0,
      requirement: 'Login time: 2am-4am'
    },
    {
      id: 'perfect_week',
      name: 'Flawless Victory',
      description: 'Improve every score category in one week',
      icon: '💎',
      rarity: 'legendary',
      points: 200,
      unlocked: false,
      progress: 0,
      requirement: 'All scores improved 7d'
    }
  ];

  /**
   * Level system based on total points
   */
  calculateLevel(totalPoints: number): { level: number; nextLevelPoints: number; progress: number } {
    const level = Math.floor(totalPoints / 100) + 1;
    const nextLevelPoints = level * 100;
    const currentLevelPoints = (level - 1) * 100;
    const progress = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    
    return { level, nextLevelPoints, progress: Math.min(progress, 100) };
  }

  /**
   * Check for newly unlocked achievements
   */
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const user = await this.getUserData(userId);
    const userProgress = await this.getUserProgress(userId);
    const newlyUnlocked: Achievement[] = [];
    
    for (const achievement of this.achievements) {
      if (achievement.unlocked) continue;
      
      const unlocked = await this.evaluateRequirement(achievement.requirement, user, userProgress);
      
      if (unlocked) {
        await this.unlockAchievement(userId, achievement.id);
        newlyUnlocked.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date(),
          progress: 100
        });
        
        // Celebrate!
        await this.notifyUnlock(userId, achievement);
      }
    }
    
    return newlyUnlocked;
  }

  /**
   * Leaderboard system with multiple views
   */
  async getLeaderboard(
    type: 'global' | 'regional' | 'local' | 'improvement' | 'newcomers',
    userId: string
  ): Promise<{ entries: LeaderboardEntry[]; userPosition: number }> {
    const entries = await this.fetchLeaderboard(type);
    const userEntry = entries.find(e => e.userId === userId);
    
    return {
      entries: entries.slice(0, 100), // Top 100
      userPosition: userEntry?.rank || 0
    };
  }

  /**
   * Smart positioning: Always show user + context
   */
  async getUserContext(userId: string): Promise<LeaderboardEntry[]> {
    const allEntries = await this.fetchLeaderboard('global');
    const userIndex = allEntries.findIndex(e => e.userId === userId);
    
    // Show: Top 3, users around you (±2), and your position
    const context = [
      ...allEntries.slice(0, 3), // Top 3
      { rank: 0, dealership: '...', score: 0, change: 0, city: '', state: '', userId: '' }, // Separator
      ...allEntries.slice(Math.max(0, userIndex - 2), userIndex + 3) // You + neighbors
    ];
    
    return context;
  }

  /**
   * Quest system for guided onboarding
   */
  onboardingQuest: Quest = {
    id: 'onboarding',
    name: 'Master Your AI Visibility',
    description: 'Complete these steps to dominate AI search results',
    progress: 0,
    completed: false,
    steps: [
      {
        id: 'run_audit',
        title: 'Run Your First Audit',
        description: 'See where you stand across all AI platforms',
        completed: false,
        action: 'Click "Audit Now"'
      },
      {
        id: 'add_competitor',
        title: 'Track a Competitor',
        description: 'Know who you\'re competing against',
        completed: false,
        action: 'Go to Competitive → Add Competitor'
      },
      {
        id: 'fix_schema',
        title: 'Implement Schema Fix',
        description: 'Fix your #1 schema issue',
        completed: false,
        action: 'Go to Schema Audit → Apply Fix',
        help_link: '/docs/schema-guide'
      },
      {
        id: 'connect_gbp',
        title: 'Connect Google Business',
        description: 'Link your GMB for real-time updates',
        completed: false,
        action: 'Settings → Integrations → Google'
      },
      {
        id: 'set_alerts',
        title: 'Configure Alerts',
        description: 'Get notified about critical changes',
        completed: false,
        action: 'Settings → Notifications'
      }
    ],
    rewards: {
      points: 100,
      badge: '🎓 AI Visibility Expert',
      feature_unlock: 'Advanced Competitive Intelligence'
    }
  };

  /**
   * Side quests for ongoing engagement
   */
  sideQuests: Quest[] = [
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Share 3 achievements on social media',
      progress: 0,
      completed: false,
      steps: [
        { id: 'share_1', title: 'First Share', description: 'Share any achievement', completed: false, action: 'Click share button' },
        { id: 'share_2', title: 'Second Share', description: 'Share another', completed: false, action: 'Share again' },
        { id: 'share_3', title: 'Third Share', description: 'One more!', completed: false, action: 'Complete the trilogy' }
      ],
      rewards: { points: 50, badge: '📱 Influencer' }
    },
    {
      id: 'competitor_crusher',
      name: 'Competitor Crusher',
      description: 'Outrank 3 competitors',
      progress: 0,
      completed: false,
      steps: [
        { id: 'beat_1', title: 'First Victory', description: 'Beat one competitor', completed: false, action: 'Improve your score' },
        { id: 'beat_2', title: 'Second Victory', description: 'Beat another', completed: false, action: 'Keep going' },
        { id: 'beat_3', title: 'Third Victory', description: 'Dominate', completed: false, action: 'Finish them' }
      ],
      rewards: { points: 150, badge: '⚔️ Vanquisher' }
    }
  ];

  /**
   * Get active quests for user
   */
  async getActiveQuests(userId: string): Promise<Quest[]> {
    const userProgress = await this.getUserProgress(userId);
    
    return [this.onboardingQuest, ...this.sideQuests]
      .map(quest => ({
        ...quest,
        steps: quest.steps.map(step => ({
          ...step,
          completed: userProgress.completedSteps.includes(step.id)
        })),
        progress: this.calculateQuestProgress(quest, userProgress)
      }))
      .filter(quest => quest.progress < 100); // Only show incomplete
  }

  /**
   * Weekly competition system
   */
  async createWeeklyChallenge(): Promise<{
    name: string;
    description: string;
    prize: string;
    endsAt: Date;
    participants: number;
    tracking: string;
  }> {
    return {
      name: 'Weekly Climb',
      description: 'Improve your score the most this week',
      prize: 'Featured in newsletter + $50 Amazon gift card',
      endsAt: this.getNextSunday(),
      participants: await this.getOptedInUsers(),
      tracking: 'score_delta'
    };
  }

  /**
   * Streak tracking for engagement
   */
  async updateStreak(userId: string): Promise<number> {
    const userProgress = await this.getUserProgress(userId);
    const today = new Date();
    const lastActive = new Date(userProgress.lastActive);
    
    // Check if user was active yesterday (maintains streak)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActive.toDateString() === yesterday.toDateString()) {
      // Continue streak
      const newStreak = userProgress.streak + 1;
      await this.updateUserProgress(userId, { streak: newStreak, lastActive: today });
      return newStreak;
    } else if (lastActive.toDateString() === today.toDateString()) {
      // Already updated today
      return userProgress.streak;
    } else {
      // Streak broken, reset to 1
      await this.updateUserProgress(userId, { streak: 1, lastActive: today });
      return 1;
    }
  }

  // Helper methods
  private async getUserData(userId: string) {
    // Mock implementation
    return {
      id: userId,
      aiScore: 75,
      rank: 3,
      city: 'Naples',
      state: 'FL',
      lastLogin: new Date(),
      auditsCompleted: 2,
      competitorsTracked: 1,
      shares: 0,
      referrals: 0
    };
  }

  private async getUserProgress(userId: string): Promise<UserProgress> {
    // Mock implementation
    return {
      userId,
      totalPoints: 150,
      level: 2,
      achievements: [],
      completedQuests: [],
      currentQuests: [],
      streak: 5,
      lastActive: new Date(),
      completedSteps: []
    };
  }

  private async evaluateRequirement(requirement: string, user: any, progress: UserProgress): Promise<boolean> {
    // Simple requirement evaluation
    if (requirement.includes('Complete 1 audit')) return user.auditsCompleted >= 1;
    if (requirement.includes('Track 1 competitor')) return user.competitorsTracked >= 1;
    if (requirement.includes('AI Score ≥ 50')) return user.aiScore >= 50;
    if (requirement.includes('AI Score ≥ 75')) return user.aiScore >= 75;
    if (requirement.includes('AI Score ≥ 90')) return user.aiScore >= 90;
    if (requirement.includes('Login streak ≥ 7')) return progress.streak >= 7;
    if (requirement.includes('Login streak ≥ 30')) return progress.streak >= 30;
    if (requirement.includes('Share 1 achievement')) return user.shares >= 1;
    if (requirement.includes('Successful referral')) return user.referrals >= 1;
    
    return false;
  }

  private async unlockAchievement(userId: string, achievementId: string) {
    // Unlock achievement for user
    console.log(`Unlocked achievement ${achievementId} for user ${userId}`);
  }

  private async notifyUnlock(userId: string, achievement: Achievement) {
    // Send notification about achievement unlock
    console.log(`Notifying user ${userId} about achievement: ${achievement.name}`);
  }

  private async fetchLeaderboard(type: string): Promise<LeaderboardEntry[]> {
    // Mock leaderboard data
    return [
      { rank: 1, dealership: 'Top Dealer', score: 95, change: 0, city: 'Miami', state: 'FL', userId: 'user1' },
      { rank: 2, dealership: 'Second Best', score: 92, change: 2, city: 'Tampa', state: 'FL', userId: 'user2' },
      { rank: 3, dealership: 'Third Place', score: 89, change: -1, city: 'Orlando', state: 'FL', userId: 'user3' }
    ];
  }

  private calculateQuestProgress(quest: Quest, progress: UserProgress): number {
    const completedSteps = quest.steps.filter(step => 
      progress.completedSteps.includes(step.id)
    ).length;
    return (completedSteps / quest.steps.length) * 100;
  }

  private getNextSunday(): Date {
    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()));
    return nextSunday;
  }

  private async getOptedInUsers(): Promise<number> {
    // Get number of users opted into competitions
    return 150;
  }

  private async updateUserProgress(userId: string, updates: Partial<UserProgress>) {
    // Update user progress in database
    console.log(`Updating progress for user ${userId}:`, updates);
  }
}

export default GamificationEngine;