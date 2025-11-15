/**
 * CoachAgent - Orchestrator Integration
 * 
 * Monitors agent→human handoffs and triggers coaching
 */

import type { CoachEvent, HandoffState, HandoffContext } from '@/packages/core-models/src/coach';
import { handleCoachEvent } from '@/packages/coach-engine/src';

export class CoachAgent {
  /**
   * Monitor handoff state transitions
   */
  monitorHandoff(context: HandoffContext): CoachEvent | null {
    // Detect when human is required but action is pending
    if (context.state === 'HUMAN_REQUIRED') {
      const timeSinceRequired = Date.now() - new Date(context.timestamp).getTime();
      const minutesSinceRequired = timeSinceRequired / (1000 * 60);

      // If human has been required for > 5 minutes, trigger coaching
      if (minutesSinceRequired > 5) {
        return {
          id: `coach_${Date.now()}`,
          dealerId: context.flowId, // TODO: Get from context
          userId: context.flowId, // TODO: Get from context
          persona: 'manager', // TODO: Detect from context
          app: 'orchestrator',
          sourceAgent: context.agentId,
          kind: 'compliance_block_waiting',
          context: {
            flowId: context.flowId,
            agentId: context.agentId,
            state: context.state,
            minutesWaiting: Math.floor(minutesSinceRequired),
          },
          occurredAt: new Date().toISOString(),
        };
      }
    }

    return null;
  }

  /**
   * Detect agent recommendation ignored
   */
  detectRecommendationIgnored(
    agentId: string,
    recommendationId: string,
    userId: string,
    dealerId: string,
    persona: string,
    topic?: string
  ): CoachEvent {
    return {
      id: `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dealerId,
      userId,
      persona: persona as any,
      app: 'orchestrator',
      sourceAgent: agentId,
      kind: 'agent_recommendation_ignored',
      context: {
        recommendationId,
        topic,
        agentId,
      },
      occurredAt: new Date().toISOString(),
    };
  }

  /**
   * Detect flow abandonment
   */
  detectFlowAbandoned(
    flowId: string,
    flowType: string,
    userId: string,
    dealerId: string,
    persona: string
  ): CoachEvent {
    return {
      id: `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dealerId,
      userId,
      persona: persona as any,
      app: 'orchestrator',
      kind: 'flow_abandoned',
      context: {
        flowId,
        flowType,
      },
      occurredAt: new Date().toISOString(),
    };
  }
}

