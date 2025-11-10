/**
 * AgentLoader - Multi-Agent Orchestration System
 * 
 * Handles agent routing, task execution, and real-time status updates
 * for the DealershipAI dashboard.
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { executeAgent, AgentType, AgentContext, AgentResult } from '@/lib/ai/agent-executor';

export interface AgentConfig {
  id: string;
  name: string;
  provider: 'claude' | 'chatgpt' | 'perplexity' | 'gemini';
  model: string;
  priority: number;
  capabilities: string[];
  costPerRequest: number;
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
}

export interface TaskStatus {
  taskId: string;
  agentId: string;
  taskType: AgentType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: AgentResult;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface AgentLoaderProps {
  dealerId: string;
  businessInfo: {
    name: string;
    domain: string;
    location?: string;
    industry?: string;
  };
  onTaskComplete?: (taskId: string, result: AgentResult) => void;
  onTaskError?: (taskId: string, error: string) => void;
}

/**
 * Agent routing configuration
 * Maps task types to preferred agents with fallback chains
 */
const AGENT_ROUTING: Record<string, string[]> = {
  'schema-analysis': ['claude-sonnet', 'chatgpt-4'],
  'ugc-analysis': ['claude-sonnet', 'chatgpt-4'],
  'voice-optimization': ['chatgpt-4', 'claude-sonnet'],
  'generate-response': ['chatgpt-4', 'claude-sonnet'],
  'competitive-intel': ['perplexity', 'chatgpt-4'],
  'localSEO': ['claude-sonnet', 'gemini'],
  'ecommerceSEO': ['chatgpt-4', 'claude-sonnet'],
  'videoSEO': ['chatgpt-4', 'gemini'],
  'fullAudit': ['claude-sonnet', 'chatgpt-4', 'perplexity'],
};

/**
 * Agent registry with capabilities and configurations
 */
const AGENT_REGISTRY: Record<string, AgentConfig> = {
  'claude-sonnet': {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    provider: 'claude',
    model: 'claude-3-sonnet-20240229',
    priority: 1,
    capabilities: ['schema-analysis', 'ugc-analysis', 'localSEO', 'fullAudit'],
    costPerRequest: 0.003,
    rateLimit: { requests: 50, window: 60 },
  },
  'chatgpt-4': {
    id: 'chatgpt-4',
    name: 'ChatGPT-4',
    provider: 'chatgpt',
    model: 'gpt-4-turbo-preview',
    priority: 2,
    capabilities: ['voice-optimization', 'generate-response', 'ecommerceSEO', 'videoSEO'],
    costPerRequest: 0.03,
    rateLimit: { requests: 50, window: 60 },
  },
  'perplexity': {
    id: 'perplexity',
    name: 'Perplexity AI',
    provider: 'perplexity',
    model: 'llama-3.1-sonar-large-128k-online',
    priority: 3,
    capabilities: ['competitive-intel', 'fullAudit'],
    costPerRequest: 0.001,
    rateLimit: { requests: 200, window: 60 },
  },
  'gemini': {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'gemini',
    model: 'gemini-pro',
    priority: 4,
    capabilities: ['localSEO', 'videoSEO'],
    costPerRequest: 0.00025,
    rateLimit: { requests: 150, window: 60 },
  },
};

export default function AgentLoader({
  dealerId,
  businessInfo,
  onTaskComplete,
  onTaskError,
}: AgentLoaderProps) {
  const [tasks, setTasks] = useState<Map<string, TaskStatus>>(new Map());
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [agentStatus, setAgentStatus] = useState<Record<string, 'ready' | 'busy' | 'error'>>({});

  // Initialize agent status
  useEffect(() => {
    const initialStatus: Record<string, 'ready' | 'busy' | 'error'> = {};
    Object.keys(AGENT_REGISTRY).forEach(agentId => {
      initialStatus[agentId] = 'ready';
    });
    setAgentStatus(initialStatus);
  }, []);

  /**
   * Execute a task with agent routing and fallback
   */
  const executeTask = useCallback(async (
    taskType: AgentType,
    context?: Partial<AgentContext>
  ): Promise<string> => {
    const taskId = `${taskType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get agent routing for this task type
    const agentChain = AGENT_ROUTING[taskType] || ['claude-sonnet'];
    
    // Create task status
    const taskStatus: TaskStatus = {
      taskId,
      agentId: agentChain[0],
      taskType,
      status: 'pending',
      startedAt: new Date(),
    };

    setTasks(prev => new Map(prev).set(taskId, taskStatus));
    setActiveAgents(prev => new Set(prev).add(agentChain[0]));

    // Build agent context
    const agentContext: AgentContext = {
      domain: businessInfo.domain,
      dealerId,
      location: businessInfo.location,
      businessInfo,
      ...context,
    };

    // Execute with fallback chain
    let lastError: Error | null = null;
    
    for (const agentId of agentChain) {
      try {
        // Update task status
        setTasks(prev => {
          const updated = new Map(prev);
          const current = updated.get(taskId);
          if (current) {
            updated.set(taskId, {
              ...current,
              status: 'running',
              agentId,
              progress: 50,
            });
          }
          return updated;
        });

        setAgentStatus(prev => ({ ...prev, [agentId]: 'busy' }));

        // Execute agent task
        const result = await executeAgent(taskType, agentContext);

        // Task completed successfully
        setTasks(prev => {
          const updated = new Map(prev);
          const current = updated.get(taskId);
          if (current) {
            updated.set(taskId, {
              ...current,
              status: 'completed',
              result,
              progress: 100,
              completedAt: new Date(),
            });
          }
          return updated;
        });

        setAgentStatus(prev => ({ ...prev, [agentId]: 'ready' }));
        setActiveAgents(prev => {
          const updated = new Set(prev);
          updated.delete(agentId);
          return updated;
        });

        // Call completion callback
        if (onTaskComplete) {
          onTaskComplete(taskId, result);
        }

        return taskId;

      } catch (error: any) {
        lastError = error;
        console.warn(`Agent ${agentId} failed for task ${taskType}:`, error);
        
        // Try next agent in chain
        setAgentStatus(prev => ({ ...prev, [agentId]: 'error' }));
        continue;
      }
    }

    // All agents failed
    const errorMessage = lastError?.message || 'All agents failed to execute task';
    
    setTasks(prev => {
      const updated = new Map(prev);
      const current = updated.get(taskId);
      if (current) {
        updated.set(taskId, {
          ...current,
          status: 'failed',
          error: errorMessage,
          completedAt: new Date(),
        });
      }
      return updated;
    });

    setActiveAgents(prev => {
      const updated = new Set(prev);
      agentChain.forEach(id => updated.delete(id));
      return updated;
    });

    if (onTaskError) {
      onTaskError(taskId, errorMessage);
    }

    throw new Error(errorMessage);
  }, [dealerId, businessInfo, onTaskComplete, onTaskError]);

  /**
   * Get task status
   */
  const getTaskStatus = useCallback((taskId: string): TaskStatus | undefined => {
    return tasks.get(taskId);
  }, [tasks]);

  /**
   * Get all active tasks
   */
  const getActiveTasks = useMemo(() => {
    return Array.from(tasks.values()).filter(
      task => task.status === 'pending' || task.status === 'running'
    );
  }, [tasks]);

  /**
   * Get completed tasks
   */
  const getCompletedTasks = useMemo(() => {
    return Array.from(tasks.values()).filter(task => task.status === 'completed');
  }, [tasks]);

  /**
   * Get failed tasks
   */
  const getFailedTasks = useMemo(() => {
    return Array.from(tasks.values()).filter(task => task.status === 'failed');
  }, [tasks]);

  /**
   * Check if agent is available
   */
  const isAgentAvailable = useCallback((agentId: string): boolean => {
    const agent = AGENT_REGISTRY[agentId];
    if (!agent) return false;

    const status = agentStatus[agentId];
    if (status === 'error' || status === 'busy') return false;

    // Check if agent is currently active
    if (activeAgents.has(agentId)) return false;

    return true;
  }, [agentStatus, activeAgents]);

  /**
   * Get agent configuration
   */
  const getAgentConfig = useCallback((agentId: string): AgentConfig | undefined => {
    return AGENT_REGISTRY[agentId];
  }, []);

  /**
   * Clear completed tasks
   */
  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => {
      const updated = new Map(prev);
      Array.from(updated.entries()).forEach(([taskId, task]) => {
        if (task.status === 'completed' || task.status === 'failed') {
          updated.delete(taskId);
        }
      });
      return updated;
    });
  }, []);

  /**
   * Retry failed task
   */
  const retryTask = useCallback(async (taskId: string): Promise<string> => {
    const task = tasks.get(taskId);
    if (!task || task.status !== 'failed') {
      throw new Error('Task not found or not in failed state');
    }

    // Remove old task
    setTasks(prev => {
      const updated = new Map(prev);
      updated.delete(taskId);
      return updated;
    });

    // Execute again
    return executeTask(task.taskType);
  }, [tasks, executeTask]);

  // Expose methods via ref (for parent components)
  const agentLoaderRef = useMemo(() => ({
    executeTask,
    getTaskStatus,
    getActiveTasks,
    getCompletedTasks,
    getFailedTasks,
    isAgentAvailable,
    getAgentConfig,
    clearCompletedTasks,
    retryTask,
  }), [
    executeTask,
    getTaskStatus,
    getActiveTasks,
    getCompletedTasks,
    getFailedTasks,
    isAgentAvailable,
    getAgentConfig,
    clearCompletedTasks,
    retryTask,
  ]);

  // Provide agent loader context to children
  return (
    <AgentLoaderContext.Provider value={agentLoaderRef}>
      {children}
    </AgentLoaderContext.Provider>
  );
}

/**
 * Agent Loader Context for accessing agent methods
 */
export const AgentLoaderContext = React.createContext<{
  executeTask: (taskType: AgentType, context?: Partial<AgentContext>) => Promise<string>;
  getTaskStatus: (taskId: string) => TaskStatus | undefined;
  getActiveTasks: TaskStatus[];
  getCompletedTasks: TaskStatus[];
  getFailedTasks: TaskStatus[];
  isAgentAvailable: (agentId: string) => boolean;
  getAgentConfig: (agentId: string) => AgentConfig | undefined;
  clearCompletedTasks: () => void;
  retryTask: (taskId: string) => Promise<string>;
} | null>(null);

/**
 * Hook to use AgentLoader context
 */
export function useAgentLoader() {
  const context = React.useContext(AgentLoaderContext);
  if (!context) {
    throw new Error('useAgentLoader must be used within AgentLoader');
  }
  return context;
}

/**
 * Agent Status Indicator Component
 */
export function AgentStatusIndicator({ agentId }: { agentId: string }) {
  const loader = useAgentLoader();
  const [status, setStatus] = useState<'ready' | 'busy' | 'error'>('ready');

  useEffect(() => {
    const agent = loader.getAgentConfig(agentId);
    if (agent) {
      const isAvailable = loader.isAgentAvailable(agentId);
      setStatus(isAvailable ? 'ready' : 'busy');
    }
  }, [loader, agentId]);

  const statusColors = {
    ready: 'bg-green-500',
    busy: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const statusLabels = {
    ready: 'Ready',
    busy: 'Busy',
    error: 'Error',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
      <span className="text-xs text-gray-600">{statusLabels[status]}</span>
    </div>
  );
}

/**
 * Task Status Component
 */
export function TaskStatusDisplay({ taskId }: { taskId: string }) {
  const loader = useAgentLoader();
  const [task, setTask] = useState<TaskStatus | undefined>();

  useEffect(() => {
    const currentTask = loader.getTaskStatus(taskId);
    setTask(currentTask);

    // Poll for updates
    const interval = setInterval(() => {
      const updated = loader.getTaskStatus(taskId);
      if (updated) {
        setTask(updated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loader, taskId]);

  if (!task) return null;

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
      <div className="flex-1">
        <div className="text-sm font-medium">{task.taskType}</div>
        <div className="text-xs text-gray-500">{task.agentId}</div>
      </div>
      <div className="flex items-center gap-2">
        {task.status === 'running' && task.progress !== undefined && (
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
        <span className={`text-xs px-2 py-1 rounded ${
          task.status === 'completed' ? 'bg-green-100 text-green-800' :
          task.status === 'failed' ? 'bg-red-100 text-red-800' :
          task.status === 'running' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {task.status}
        </span>
      </div>
    </div>
  );
}

