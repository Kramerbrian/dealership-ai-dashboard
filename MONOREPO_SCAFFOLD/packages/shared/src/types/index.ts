/**
 * Shared TypeScript types for DealershipAI Cognitive Ops Platform
 * Generated from COGNITIVE_OPS_MASTER_BLUEPRINT_V1.json
 */

// Database Models
export interface DealerContext {
  dealerId: string
  context: Record<string, any>
  lastUpdated: Date
  personalityLevel: 'formal' | 'dry-wit' | 'full-dai'
  userTenure: number // days since signup
}

export interface GlobalPatterns {
  id: string
  patternType: string
  anonymizedData: Record<string, any>
  createdAt: Date
  expiresAt: Date
}

export interface OrchestratorUsage {
  dealerId: string
  action: string
  timestamp: Date
  cost: number
  tier: 'test_drive' | 'intelligence' | 'boss_mode'
  overage: boolean
}

export interface Mission {
  id: string
  dealerId: string
  agentId: string
  status: 'active' | 'queued' | 'completed' | 'failed'
  confidence: number
  startedAt: Date
  completedAt?: Date
  evidence?: any[]
  category?: 'quick_win' | 'strategic' | 'maintenance'
}

export interface OrchestratorState {
  dealerId: string
  confidence: number
  autonomyEnabled: boolean
  currentMode: string
  activeAgents: string[]
  lastOrchestration?: Date
  orchestrationCount: number
}

// API Types
export interface OrchestratorRequest {
  action: 'analyze_visibility' | 'compute_qai' | 'calculate_oci' | 'generate_asr' | 'analyze_ugc'
  dealerId: string
  domain?: string
  context?: Record<string, any>
  parameters?: Record<string, any>
}

export interface OrchestratorResponse {
  success: boolean
  result?: any
  confidence?: number
  traceId?: string
  error?: string
}

// KPI Metrics
export interface KPIMetrics {
  aiv: number // AI Visibility (0-100)
  qai: number // Quality Authority Index (0-100)
  piqr: number // Performance Impact Quality Risk (0-1)
  oci: number // Opportunity Cost of Inaction (dollars)
  ati: number // Algorithmic Trust Index (0-100)
  asrRoi: number // ASR ROI (0-100)
}

// Message Types
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  confidence?: number
  traceId?: string
}

// Component Props
export interface HALChatProps {
  dealerId: string
  domain?: string
  className?: string
}

export interface MissionCardProps {
  mission: Mission
  onClick: () => void
}

export interface ConfidenceRibbonProps {
  metrics?: KPIMetrics
}

