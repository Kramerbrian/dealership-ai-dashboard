/**
 * Team Accountability and Task Management System
 * 
 * Comprehensive team management platform:
 * - Task assignment and tracking
 * - Performance metrics
 * - Goal setting and monitoring
 * - Team collaboration tools
 * - Accountability reporting
 */

import { supabaseAdmin } from './supabase';

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  department: string;
  manager_id?: string;
  is_active: boolean;
  hire_date: string;
  last_login: string;
  performance_score: number;
  goals: Goal[];
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee_id: string;
  assigner_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: 'ai_optimization' | 'content_creation' | 'analysis' | 'maintenance' | 'other';
  due_date: string;
  estimated_hours: number;
  actual_hours?: number;
  progress_percentage: number;
  dependencies: string[];
  tags: string[];
  attachments: string[];
  comments: TaskComment[];
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'performance' | 'learning' | 'project' | 'personal';
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage: number;
  milestones: GoalMilestone[];
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  target_value: number;
  achieved_value: number;
  deadline: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface TeamPerformance {
  team_id: string;
  period: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  average_completion_time: number;
  overdue_tasks: number;
  team_score: number;
  top_performers: string[];
  improvement_areas: string[];
  metrics: {
    productivity: number;
    quality: number;
    collaboration: number;
    innovation: number;
  };
}

export interface AccountabilityReport {
  id: string;
  user_id: string;
  period: string;
  tasks_completed: number;
  tasks_overdue: number;
  goals_achieved: number;
  goals_missed: number;
  performance_score: number;
  feedback: string;
  action_items: string[];
  created_at: string;
}

export class TeamManagementSystem {
  private supabase: any;

  constructor() {
    this.supabase = supabaseAdmin;
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId?: string): Promise<TeamMember[]> {
    try {
      if (this.supabase) {
        let query = this.supabase
          .from('team_members')
          .select('*')
          .eq('is_active', true);

        if (teamId) {
          query = query.eq('team_id', teamId);
        }

        const { data } = await query.order('name');

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }

    return this.getMockTeamMembers();
  }

  /**
   * Create a new task
   */
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (this.supabase) {
        await this.supabase
          .from('tasks')
          .insert(newTask);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }

    return newTask;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase
          .from('tasks')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }

    return false;
  }

  /**
   * Get tasks for a user
   */
  async getUserTasks(userId: string, filters?: {
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<Task[]> {
    try {
      if (this.supabase) {
        let query = this.supabase
          .from('tasks')
          .select('*')
          .eq('assignee_id', userId);

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.priority) {
          query = query.eq('priority', filters.priority);
        }
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        const { data } = await query.order('due_date');

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }

    return this.getMockTasks(userId);
  }

  /**
   * Get team tasks
   */
  async getTeamTasks(teamId: string): Promise<Task[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('tasks')
          .select(`
            *,
            team_members!inner(team_id)
          `)
          .eq('team_members.team_id', teamId)
          .order('due_date');

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching team tasks:', error);
    }

    return [];
  }

  /**
   * Add task comment
   */
  async addTaskComment(
    taskId: string,
    userId: string,
    content: string
  ): Promise<TaskComment> {
    const comment: TaskComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task_id: taskId,
      user_id: userId,
      content,
      created_at: new Date().toISOString(),
    };

    try {
      if (this.supabase) {
        await this.supabase
          .from('task_comments')
          .insert(comment);
      }
    } catch (error) {
      console.error('Error adding task comment:', error);
    }

    return comment;
  }

  /**
   * Create a goal
   */
  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (this.supabase) {
        await this.supabase
          .from('goals')
          .insert(newGoal);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }

    return newGoal;
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    goalId: string,
    currentValue: number,
    milestoneUpdates?: { milestoneId: string; achievedValue: number }[]
  ): Promise<boolean> {
    try {
      if (this.supabase) {
        // Update goal
        const { data: goal } = await this.supabase
          .from('goals')
          .select('target_value')
          .eq('id', goalId)
          .single();

        if (goal) {
          const progressPercentage = (currentValue / goal.target_value) * 100;
          const status = progressPercentage >= 100 ? 'completed' : 'active';

          await this.supabase
            .from('goals')
            .update({
              current_value: currentValue,
              progress_percentage: progressPercentage,
              status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', goalId);
        }

        // Update milestones if provided
        if (milestoneUpdates) {
          for (const update of milestoneUpdates) {
            await this.supabase
              .from('goal_milestones')
              .update({
                achieved_value: update.achievedValue,
                is_completed: update.achievedValue >= goal?.target_value,
                completed_at: update.achievedValue >= goal?.target_value ? new Date().toISOString() : null,
              })
              .eq('id', update.milestoneId);
          }
        }

        return true;
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }

    return false;
  }

  /**
   * Get user goals
   */
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      if (this.supabase) {
        const { data } = await this.supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .order('deadline');

        return data || [];
      }
    } catch (error) {
      console.error('Error fetching user goals:', error);
    }

    return this.getMockGoals(userId);
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformance(teamId: string, period: string = 'month'): Promise<TeamPerformance> {
    try {
      if (this.supabase) {
        // Get team tasks
        const { data: tasks } = await this.supabase
          .from('tasks')
          .select(`
            *,
            team_members!inner(team_id)
          `)
          .eq('team_members.team_id', teamId);

        // Get team goals
        const { data: goals } = await this.supabase
          .from('goals')
          .select(`
            *,
            team_members!inner(team_id)
          `)
          .eq('team_members.team_id', teamId);

        // Calculate metrics
        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const overdueTasks = tasks?.filter(t => 
          t.due_date < new Date().toISOString() && t.status !== 'completed'
        ).length || 0;

        return {
          team_id: teamId,
          period,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_rate: completionRate,
          average_completion_time: 0, // Calculate based on actual data
          overdue_tasks: overdueTasks,
          team_score: completionRate,
          top_performers: [],
          improvement_areas: [],
          metrics: {
            productivity: completionRate,
            quality: 85,
            collaboration: 78,
            innovation: 72,
          },
        };
      }
    } catch (error) {
      console.error('Error fetching team performance:', error);
    }

    return this.getMockTeamPerformance(teamId, period);
  }

  /**
   * Generate accountability report
   */
  async generateAccountabilityReport(
    userId: string,
    period: string = 'month'
  ): Promise<AccountabilityReport> {
    try {
      if (this.supabase) {
        // Get user tasks
        const { data: tasks } = await this.supabase
          .from('tasks')
          .select('*')
          .eq('assignee_id', userId);

        // Get user goals
        const { data: goals } = await this.supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId);

        const tasksCompleted = tasks?.filter(t => t.status === 'completed').length || 0;
        const tasksOverdue = tasks?.filter(t => 
          t.due_date < new Date().toISOString() && t.status !== 'completed'
        ).length || 0;

        const goalsAchieved = goals?.filter(g => g.status === 'completed').length || 0;
        const goalsMissed = goals?.filter(g => 
          g.deadline < new Date().toISOString() && g.status !== 'completed'
        ).length || 0;

        const performanceScore = this.calculatePerformanceScore(
          tasksCompleted,
          tasksOverdue,
          goalsAchieved,
          goalsMissed
        );

        const report: AccountabilityReport = {
          id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          period,
          tasks_completed: tasksCompleted,
          tasks_overdue: tasksOverdue,
          goals_achieved: goalsAchieved,
          goals_missed: goalsMissed,
          performance_score: performanceScore,
          feedback: this.generateFeedback(performanceScore, tasksOverdue, goalsMissed),
          action_items: this.generateActionItems(tasksOverdue, goalsMissed),
          created_at: new Date().toISOString(),
        };

        // Store report
        await this.supabase
          .from('accountability_reports')
          .insert(report);

        return report;
      }
    } catch (error) {
      console.error('Error generating accountability report:', error);
    }

    return this.getMockAccountabilityReport(userId, period);
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(
    tasksCompleted: number,
    tasksOverdue: number,
    goalsAchieved: number,
    goalsMissed: number
  ): number {
    const totalTasks = tasksCompleted + tasksOverdue;
    const totalGoals = goalsAchieved + goalsMissed;

    const taskScore = totalTasks > 0 ? (tasksCompleted / totalTasks) * 50 : 50;
    const goalScore = totalGoals > 0 ? (goalsAchieved / totalGoals) * 50 : 50;

    return Math.round(taskScore + goalScore);
  }

  /**
   * Generate feedback based on performance
   */
  private generateFeedback(
    performanceScore: number,
    tasksOverdue: number,
    goalsMissed: number
  ): string {
    if (performanceScore >= 90) {
      return 'Excellent performance! You\'re consistently meeting and exceeding expectations.';
    } else if (performanceScore >= 75) {
      return 'Good performance overall. Consider focusing on time management to improve further.';
    } else if (performanceScore >= 60) {
      return 'Performance needs improvement. Focus on completing tasks on time and meeting goals.';
    } else {
      return 'Performance requires immediate attention. Please review priorities and seek support.';
    }
  }

  /**
   * Generate action items
   */
  private generateActionItems(tasksOverdue: number, goalsMissed: number): string[] {
    const actionItems: string[] = [];

    if (tasksOverdue > 0) {
      actionItems.push(`Address ${tasksOverdue} overdue task(s)`);
    }

    if (goalsMissed > 0) {
      actionItems.push(`Review and update ${goalsMissed} missed goal(s)`);
    }

    if (actionItems.length === 0) {
      actionItems.push('Continue current performance level');
      actionItems.push('Set new challenging goals');
    }

    return actionItems;
  }

  /**
   * Get mock team members
   */
  private getMockTeamMembers(): TeamMember[] {
    return [
      {
        id: 'member-1',
        user_id: 'user-1',
        name: 'John Smith',
        email: 'john@dealership.com',
        role: 'manager',
        department: 'Sales',
        is_active: true,
        hire_date: '2023-01-15',
        last_login: new Date().toISOString(),
        performance_score: 85,
        goals: [],
        tasks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'member-2',
        user_id: 'user-2',
        name: 'Sarah Johnson',
        email: 'sarah@dealership.com',
        role: 'analyst',
        department: 'Marketing',
        manager_id: 'member-1',
        is_active: true,
        hire_date: '2023-03-20',
        last_login: new Date().toISOString(),
        performance_score: 92,
        goals: [],
        tasks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get mock tasks
   */
  private getMockTasks(userId: string): Task[] {
    return [
      {
        id: 'task-1',
        title: 'Optimize AI visibility for Q1',
        description: 'Review and improve AI search visibility metrics',
        assignee_id: userId,
        assigner_id: 'manager-1',
        priority: 'high',
        status: 'in_progress',
        category: 'ai_optimization',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 8,
        progress_percentage: 60,
        dependencies: [],
        tags: ['ai', 'optimization', 'q1'],
        attachments: [],
        comments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get mock goals
   */
  private getMockGoals(userId: string): Goal[] {
    return [
      {
        id: 'goal-1',
        user_id: userId,
        title: 'Increase AI visibility score',
        description: 'Achieve 90% AI visibility score by end of quarter',
        type: 'performance',
        target_value: 90,
        current_value: 75,
        unit: 'percentage',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        progress_percentage: 83,
        milestones: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get mock team performance
   */
  private getMockTeamPerformance(teamId: string, period: string): TeamPerformance {
    return {
      team_id: teamId,
      period,
      total_tasks: 25,
      completed_tasks: 20,
      completion_rate: 80,
      average_completion_time: 3.5,
      overdue_tasks: 2,
      team_score: 82,
      top_performers: ['user-2', 'user-3'],
      improvement_areas: ['Time management', 'Communication'],
      metrics: {
        productivity: 80,
        quality: 85,
        collaboration: 78,
        innovation: 72,
      },
    };
  }

  /**
   * Get mock accountability report
   */
  private getMockAccountabilityReport(userId: string, period: string): AccountabilityReport {
    return {
      id: `report-${Date.now()}`,
      user_id: userId,
      period,
      tasks_completed: 8,
      tasks_overdue: 1,
      goals_achieved: 2,
      goals_missed: 0,
      performance_score: 85,
      feedback: 'Good performance overall. Consider focusing on time management to improve further.',
      action_items: ['Address 1 overdue task', 'Continue current performance level'],
      created_at: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const teamManagementSystem = new TeamManagementSystem();
