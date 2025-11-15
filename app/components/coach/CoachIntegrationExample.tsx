/**
 * Example: How to integrate Coach into your components
 * 
 * This file shows patterns for emitting CoachEvents from various scenarios
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useCoachEvent, useCoach } from '@/hooks/useCoachContext';
import { CoachPopover } from './CoachPopover';

/**
 * Example 1: Pulse Card - Recommendation Ignored
 */
export function PulseCardWithCoach({ card }: { card: any }) {
  const { emitEvent } = useCoachEvent();
  const { activeSuggestion, acceptSuggestion, dismissSuggestion } = useCoach();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If card is opened but no action after 2 minutes
    const timer = setTimeout(() => {
      emitEvent({
        dealerId: card.dealerId,
        userId: card.userId,
        persona: 'sales',
        app: 'dash',
        sourceAgent: 'Pulse',
        kind: 'agent_recommendation_ignored',
        context: {
          cardId: card.id,
          cardType: card.type,
          topic: 'trade_followup',
          revenueAtRisk: card.revenueAtRisk,
        },
      });
    }, 2 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [card.id, emitEvent]);

  return (
    <div ref={cardRef} className="relative">
      {/* Card content */}
      
      {/* Coach popover */}
      {activeSuggestion && (
        <CoachPopover
          suggestion={activeSuggestion}
          onAccept={acceptSuggestion}
          onDismiss={dismissSuggestion}
          anchorElement={cardRef.current}
        />
      )}
    </div>
  );
}

/**
 * Example 2: Flow Abandonment Detection
 */
export function PricingFlowWithCoach() {
  const { emitEvent, recordOutcome } = useCoachEvent();
  const [step, setStep] = useState(1);
  const flowStartTime = useRef(Date.now());

  // Detect abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (step < 3) {
        // Flow not completed
        emitEvent({
          dealerId: 'dealer-123',
          userId: 'user-456',
          persona: 'manager',
          app: 'dash',
          kind: 'flow_abandoned',
          context: {
            flowType: 'pricing',
            step,
            timeSpent: Date.now() - flowStartTime.current,
          },
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, emitEvent]);

  const handleComplete = () => {
    recordOutcome('completed_flow');
  };

  return (
    <div>
      {/* Flow steps */}
      <button onClick={handleComplete}>Complete</button>
    </div>
  );
}

/**
 * Example 3: Error Loop Detection
 */
export function ErrorHandlerWithCoach() {
  const { emitEvent } = useCoachEvent();
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);

  const handleError = (error: Error) => {
    const now = Date.now();
    const timeSinceLastError = now - lastErrorTimeRef.current;

    // If same error > 2 times in 24 hours
    if (timeSinceLastError < 24 * 60 * 60 * 1000) {
      errorCountRef.current += 1;
    } else {
      errorCountRef.current = 1;
    }

    lastErrorTimeRef.current = now;

    if (errorCountRef.current > 2) {
      emitEvent({
        dealerId: 'dealer-123',
        userId: 'user-456',
        persona: 'manager',
        app: 'dash',
        kind: 'error_loop',
        context: {
          errorMessage: error.message,
          errorCount: errorCountRef.current,
        },
      });
    }
  };

  return null; // Error boundary component
}

