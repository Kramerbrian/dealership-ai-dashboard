/**
 * Learning Center with Content Management
 * 
 * Comprehensive learning platform for dealership staff:
 * - Interactive tutorials and guides
 * - Video content management
 * - Progress tracking
 * - Certification system
 * - Content categorization and search
 */

import { supabaseAdmin } from './supabase';

export interface LearningContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'interactive' | 'quiz' | 'guide';
  category: 'onboarding' | 'features' | 'best_practices' | 'advanced' | 'compliance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number; // minutes
  content_url?: string;
  content_data?: any;
  prerequisites: string[];
  learning_objectives: string[];
  tags: string[];
  is_published: boolean;
  author: string;
  created_at: string;
  updated_at: string;
  version: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  content_ids: string[];
  estimated_duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learning_objectives: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  user_id: string;
  content_id: string;
  progress_percentage: number;
  time_spent: number; // seconds
  completed_at?: string;
  last_accessed: string;
  quiz_scores?: number[];
  notes?: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  learning_path_id: string;
  requirements: {
    completion_percentage: number;
    quiz_score_threshold: number;
    time_requirement: number;
  };
  validity_period: number; // months
  is_active: boolean;
  created_at: string;
}

export interface UserCertification {
  user_id: string;
  certification_id: string;
  earned_at: string;
  expires_at: string;
  is_valid: boolean;
  certificate_url?: string;
}

export class LearningCenterManager {
  private supabase: any;

  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Get learning content by category
   */
  async getContentByCategory(category: string): Promise<LearningContent[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('learning_content')
          .select('*')
          .eq('category', category)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching content by category:', error);
    }

    // Return mock data for development
    return this.getMockContentByCategory(category);
  }

  /**
   * Get learning paths
   */
  async getLearningPaths(): Promise<LearningPath[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('learning_paths')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    }

    return this.getMockLearningPaths();
  }

  /**
   * Get user progress
   */
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('user_learning_progress')
          .select('*')
          .eq('user_id', userId);

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }

    return [];
  }

  /**
   * Update user progress
   */
  async updateUserProgress(
    userId: string,
    contentId: string,
    progress: Partial<UserProgress>
  ): Promise<void> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('user_learning_progress')
          .upsert({
            user_id: userId,
            content_id: contentId,
            ...progress,
            last_accessed: new Date().toISOString(),
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  /**
   * Create learning content
   */
  async createContent(content: Omit<LearningContent, 'id' | 'created_at' | 'updated_at'>): Promise<LearningContent> {
    const newContent: LearningContent = {
      ...content,
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (this.supabase) {
        await this.supabase
          .from('learning_content')
          .insert(newContent);
      }
    } catch (error) {
      console.error('Error creating content:', error);
    }

    return newContent;
  }

  /**
   * Update learning content
   */
  async updateContent(contentId: string, updates: Partial<LearningContent>): Promise<boolean> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('learning_content')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contentId);

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error updating content:', error);
    }

    return false;
  }

  /**
   * Delete learning content
   */
  async deleteContent(contentId: string): Promise<boolean> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('learning_content')
          .delete()
          .eq('id', contentId);

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }

    return false;
  }

  /**
   * Search learning content
   */
  async searchContent(query: string, filters?: {
    category?: string;
    type?: string;
    difficulty?: string;
    tags?: string[];
  }): Promise<LearningContent[]> {
    try {
      if (this.supabase) {
        let queryBuilder = this.supabase
          .from('learning_content')
          .select('*')
          .eq('is_published', true);

        // Add text search
        if (query) {
          queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
        }

        // Add filters
        if (filters?.category) {
          queryBuilder = queryBuilder.eq('category', filters.category);
        }
        if (filters?.type) {
          queryBuilder = queryBuilder.eq('type', filters.type);
        }
        if (filters?.difficulty) {
          queryBuilder = queryBuilder.eq('difficulty', filters.difficulty);
        }

        const { data } = await queryBuilder.order('created_at', { ascending: false });

        return data || [];
      }
    } catch (error) {
      console.error('Error searching content:', error);
    }

    return [];
  }

  /**
   * Get user certifications
   */
  async getUserCertifications(userId: string): Promise<UserCertification[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('user_certifications')
          .select('*')
          .eq('user_id', userId)
          .eq('is_valid', true);

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching user certifications:', error);
    }

    return [];
  }

  /**
   * Award certification
   */
  async awardCertification(
    userId: string,
    certificationId: string
  ): Promise<UserCertification | null> {
    try {
      if (this.supabase) {
        // Get certification details
        const { data: certification } = await this.supabase
          .from('certifications')
          .select('*')
          .eq('id', certificationId)
          .single();

        if (!certification) return null;

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + certification.validity_period);

        const userCertification: UserCertification = {
          user_id: userId,
          certification_id: certificationId,
          earned_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_valid: true,
        };

        await this.supabase
          .from('user_certifications')
          .insert(userCertification);

        return userCertification;
      }
    } catch (error) {
      console.error('Error awarding certification:', error);
    }

    return null;
  }

  /**
   * Get learning analytics
   */
  async getLearningAnalytics(userId?: string): Promise<{
    total_content: number;
    completed_content: number;
    completion_rate: number;
    time_spent: number;
    certifications_earned: number;
    popular_content: LearningContent[];
    learning_trends: any[];
  }> {
    try {
      if (this.supabase) {
        // Get total content count
        const { count: totalContent } = await this.supabase
          .from('learning_content')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        // Get user-specific analytics if userId provided
        if (userId) {
          const { data: progress } = await this.supabase
            .from('user_learning_progress')
            .select('*')
            .eq('user_id', userId);

          const completedContent = progress?.filter(p => p.completed_at) || [];
          const totalTimeSpent = progress?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0;

          const { data: certifications } = await this.supabase
            .from('user_certifications')
            .select('*')
            .eq('user_id', userId)
            .eq('is_valid', true);

          return {
            total_content: totalContent || 0,
            completed_content: completedContent.length,
            completion_rate: totalContent ? (completedContent.length / totalContent) * 100 : 0,
            time_spent: totalTimeSpent,
            certifications_earned: certifications?.length || 0,
            popular_content: [],
            learning_trends: [],
          };
        }
      }
    } catch (error) {
      console.error('Error fetching learning analytics:', error);
    }

    return {
      total_content: 0,
      completed_content: 0,
      completion_rate: 0,
      time_spent: 0,
      certifications_earned: 0,
      popular_content: [],
      learning_trends: [],
    };
  }

  /**
   * Get mock content by category
   */
  private getMockContentByCategory(category: string): LearningContent[] {
    const mockContent: Record<string, LearningContent[]> = {
      onboarding: [
        {
          id: 'onboarding-1',
          title: 'Welcome to DealershipAI',
          description: 'Get started with the basics of DealershipAI platform',
          type: 'video',
          category: 'onboarding',
          difficulty: 'beginner',
          estimated_duration: 10,
          content_url: '/videos/welcome-tour.mp4',
          prerequisites: [],
          learning_objectives: ['Understand platform overview', 'Navigate main dashboard'],
          tags: ['welcome', 'basics', 'navigation'],
          is_published: true,
          author: 'DealershipAI Team',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: '1.0.0',
        },
        {
          id: 'onboarding-2',
          title: 'Setting Up Your Profile',
          description: 'Learn how to configure your dealership profile and preferences',
          type: 'interactive',
          category: 'onboarding',
          difficulty: 'beginner',
          estimated_duration: 15,
          content_url: '/interactive/profile-setup',
          prerequisites: ['onboarding-1'],
          learning_objectives: ['Configure dealership settings', 'Set up user preferences'],
          tags: ['profile', 'settings', 'configuration'],
          is_published: true,
          author: 'DealershipAI Team',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: '1.0.0',
        },
      ],
      features: [
        {
          id: 'features-1',
          title: 'AI Visibility Metrics Explained',
          description: 'Deep dive into AI visibility scoring and what it means for your business',
          type: 'article',
          category: 'features',
          difficulty: 'intermediate',
          estimated_duration: 20,
          content_url: '/articles/ai-visibility-metrics',
          prerequisites: ['onboarding-1'],
          learning_objectives: ['Understand AI visibility scoring', 'Interpret metrics'],
          tags: ['ai-visibility', 'metrics', 'scoring'],
          is_published: true,
          author: 'AI Team',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: '1.0.0',
        },
        {
          id: 'features-2',
          title: 'Using the What-If Simulator',
          description: 'Learn how to create and run scenario simulations',
          type: 'video',
          category: 'features',
          difficulty: 'intermediate',
          estimated_duration: 25,
          content_url: '/videos/whatif-simulator.mp4',
          prerequisites: ['features-1'],
          learning_objectives: ['Create simulation scenarios', 'Interpret results'],
          tags: ['simulator', 'scenarios', 'planning'],
          is_published: true,
          author: 'Product Team',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: '1.0.0',
        },
      ],
      best_practices: [
        {
          id: 'best-practices-1',
          title: 'Optimizing Your AI Visibility',
          description: 'Best practices for improving your dealership\'s AI search presence',
          type: 'guide',
          category: 'best_practices',
          difficulty: 'advanced',
          estimated_duration: 30,
          content_url: '/guides/ai-visibility-optimization',
          prerequisites: ['features-1'],
          learning_objectives: ['Implement optimization strategies', 'Monitor improvements'],
          tags: ['optimization', 'ai-visibility', 'best-practices'],
          is_published: true,
          author: 'Optimization Team',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: '1.0.0',
        },
      ],
    };

    return mockContent[category] || [];
  }

  /**
   * Get mock learning paths
   */
  private getMockLearningPaths(): LearningPath[] {
    return [
      {
        id: 'path-1',
        name: 'DealershipAI Fundamentals',
        description: 'Complete beginner\'s guide to using DealershipAI effectively',
        category: 'onboarding',
        content_ids: ['onboarding-1', 'onboarding-2', 'features-1'],
        estimated_duration: 45,
        difficulty: 'beginner',
        prerequisites: [],
        learning_objectives: ['Master basic platform navigation', 'Understand core features'],
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'path-2',
        name: 'Advanced Analytics Mastery',
        description: 'Deep dive into advanced analytics and optimization techniques',
        category: 'advanced',
        content_ids: ['features-1', 'features-2', 'best-practices-1'],
        estimated_duration: 75,
        difficulty: 'advanced',
        prerequisites: ['path-1'],
        learning_objectives: ['Master advanced features', 'Implement optimization strategies'],
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

// Export singleton instance
export const learningCenterManager = new LearningCenterManager();
