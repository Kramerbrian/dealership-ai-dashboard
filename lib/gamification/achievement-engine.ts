/**
 * Achievement System and Leaderboards
 * Gamification engine for user engagement
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'visibility' | 'engagement' | 'growth' | 'expertise' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  unlockedAt?: Date;
  progress: number;
  isUnlocked: boolean;
}

export interface AchievementRequirement {
  type: 'score_threshold' | 'action_count' | 'streak_days' | 'competitor_beaten' | 'social_shares';
  value: number;
  current: number;
  description: string;
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'feature_unlock' | 'discount' | 'exclusive_content';
  value: any;
  description: string;
}

export interface LeaderboardEntry {
  userId: string;
  dealershipName: string;
  totalPoints: number;
  rank: number;
  achievements: number;
  level: number;
  avatar?: string;
  lastActive: Date;
}

export interface UserProfile {
  userId: string;
  dealershipName: string;
  level: number;
  totalPoints: number;
  achievements: Achievement[];
  streak: number;
  badges: string[];
  rank: number;
  nextLevelPoints: number;
}

export class AchievementEngine {
  private achievements: Achievement[] = [];
  private leaderboard: LeaderboardEntry[] = [];
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  /**
   * Initialize default achievements
   */
  private initializeAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-scan',
        name: 'AI Explorer',
        description: 'Complete your first AI visibility scan',
        icon: '🔍',
        category: 'visibility',
        rarity: 'common',
        points: 10,
        requirements: [{ type: 'action_count', value: 1, current: 0, description: 'Complete 1 AI scan' }],
        rewards: [{ type: 'points', value: 10, description: '10 points' }],
        progress: 0,
        isUnlocked: false
      },
      {
        id: 'score-80',
        name: 'AI Visibility Master',
        description: 'Achieve an AI visibility score of 80 or higher',
        icon: '🎯',
        category: 'visibility',
        rarity: 'rare',
        points: 50,
        requirements: [{ type: 'score_threshold', value: 80, current: 0, description: 'Reach 80+ AI visibility score' }],
        rewards: [{ type: 'points', value: 50, description: '50 points' }],
        progress: 0,
        isUnlocked: false
      },
      {
        id: 'streak-7',
        name: 'Consistent Performer',
        description: 'Maintain a 7-day activity streak',
        icon: '🔥',
        category: 'engagement',
        rarity: 'rare',
        points: 75,
        requirements: [{ type: 'streak_days', value: 7, current: 0, description: '7-day activity streak' }],
        rewards: [{ type: 'points', value: 75, description: '75 points' }],
        progress: 0,
        isUnlocked: false
      },
      {
        id: 'top-competitor',
        name: 'Market Leader',
        description: 'Beat your top competitor in AI visibility',
        icon: '👑',
        category: 'growth',
        rarity: 'epic',
        points: 100,
        requirements: [{ type: 'competitor_beaten', value: 1, current: 0, description: 'Beat top competitor' }],
        rewards: [{ type: 'points', value: 100, description: '100 points' }],
        progress: 0,
        isUnlocked: false
      },
      {
        id: 'social-influencer',
        name: 'Social Influencer',
        description: 'Share 10 competitive insights',
        icon: '📢',
        category: 'social',
        rarity: 'epic',
        points: 150,
        requirements: [{ type: 'social_shares', value: 10, current: 0, description: 'Share 10 insights' }],
        rewards: [{ type: 'points', value: 150, description: '150 points' }],
        progress: 0,
        isUnlocked: false
      },
      {
        id: 'perfect-score',
        name: 'AI Perfectionist',
        description: 'Achieve a perfect 100 AI visibility score',
        icon: '💎',
        category: 'expertise',
        rarity: 'legendary',
        points: 500,
        requirements: [{ type: 'score_threshold', value: 100, current: 0, description: 'Achieve perfect 100 score' }],
        rewards: [{ type: 'points', value: 500, description: '500 points' }],
        progress: 0,
        isUnlocked: false
      }
    ];

    this.achievements = defaultAchievements;
  }

  /**
   * Check and unlock achievements for a user
   */
  async checkAchievements(userId: string, action: string, data: any): Promise<Achievement[]> {
    const userProfile = this.getUserProfile(userId);
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.isUnlocked) continue;

      let shouldUnlock = true;
      let progress = 0;

      for (const requirement of achievement.requirements) {
        const currentValue = this.getRequirementValue(requirement.type, data, userProfile);
        requirement.current = currentValue;
        
        if (currentValue < requirement.value) {
          shouldUnlock = false;
        }
        
        progress = Math.min((currentValue / requirement.value) * 100, 100);
      }

      achievement.progress = progress;

      if (shouldUnlock) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        userProfile.achievements.push(achievement);
        userProfile.totalPoints += achievement.points;
        newlyUnlocked.push(achievement);
      }
    }

    // Update user level
    this.updateUserLevel(userId);
    
    // Update leaderboard
    this.updateLeaderboard(userId);

    return newlyUnlocked;
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        dealershipName: 'Unknown Dealership',
        level: 1,
        totalPoints: 0,
        achievements: [],
        streak: 0,
        badges: [],
        rank: 0,
        nextLevelPoints: 100
      });
    }

    return this.userProfiles.get(userId)!;
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    return this.leaderboard.slice(0, limit);
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * Get user's next achievements
   */
  getNextAchievements(userId: string, limit: number = 5): Achievement[] {
    const userProfile = this.getUserProfile(userId);
    const unlockedIds = userProfile.achievements.map(a => a.id);
    
    return this.achievements
      .filter(a => !unlockedIds.includes(a.id))
      .sort((a, b) => a.points - b.points)
      .slice(0, limit);
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(userId: string, achievementId: string): number {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    return achievement.progress;
  }

  /**
   * Award points for action
   */
  awardPoints(userId: string, action: string, points: number): void {
    const userProfile = this.getUserProfile(userId);
    userProfile.totalPoints += points;
    
    // Update streak
    userProfile.streak++;
    
    this.updateUserLevel(userId);
    this.updateLeaderboard(userId);
  }

  private getRequirementValue(type: string, data: any, userProfile: UserProfile): number {
    switch (type) {
      case 'score_threshold':
        return data.score || 0;
      case 'action_count':
        return data.count || 0;
      case 'streak_days':
        return userProfile.streak;
      case 'competitor_beaten':
        return data.competitorsBeaten || 0;
      case 'social_shares':
        return data.shares || 0;
      default:
        return 0;
    }
  }

  private updateUserLevel(userId: string): void {
    const userProfile = this.getUserProfile(userId);
    const newLevel = Math.floor(userProfile.totalPoints / 100) + 1;
    
    if (newLevel > userProfile.level) {
      userProfile.level = newLevel;
      userProfile.nextLevelPoints = (newLevel + 1) * 100;
    }
  }

  private updateLeaderboard(userId: string): void {
    const userProfile = this.getUserProfile(userId);
    
    // Remove existing entry
    this.leaderboard = this.leaderboard.filter(entry => entry.userId !== userId);
    
    // Add updated entry
    this.leaderboard.push({
      userId,
      dealershipName: userProfile.dealershipName,
      totalPoints: userProfile.totalPoints,
      rank: 0, // Will be updated after sorting
      achievements: userProfile.achievements.length,
      level: userProfile.level,
      lastActive: new Date()
    });
    
    // Sort by total points and update ranks
    this.leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    this.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    // Update user rank
    userProfile.rank = this.leaderboard.find(entry => entry.userId === userId)?.rank || 0;
  }
}
