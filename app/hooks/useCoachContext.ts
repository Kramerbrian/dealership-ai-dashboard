'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CoachEvent, CoachSuggestion, CoachOutcome } from '@/packages/core-models/src/coach';
import { handleCoachEvent } from '@/packages/coach-engine/src';
import { recordCoachOutcome } from '@/packages/coach-engine/src/telemetry';

interface CoachContextValue {
  activeSuggestion: CoachSuggestion | null;
  showCoach: (event: CoachEvent) => void;
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
  recordOutcome: (outcome: CoachOutcome) => void;
}

const CoachContext = createContext<CoachContextValue | null>(null);

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const [activeSuggestion, setActiveSuggestion] = useState<CoachSuggestion | null>(null);
  const [currentEvent, setCurrentEvent] = useState<CoachEvent | null>(null);

  const showCoach = useCallback((event: CoachEvent) => {
    const decision = handleCoachEvent(event);
    
    if (decision.suggestion) {
      setActiveSuggestion(decision.suggestion);
      setCurrentEvent(event);
    }
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (activeSuggestion && currentEvent) {
      recordCoachOutcome({
        suggestionId: activeSuggestion.id,
        eventId: currentEvent.id,
        userId: currentEvent.userId,
        dealerId: currentEvent.dealerId,
        outcome: 'accepted',
        occurredAt: new Date().toISOString(),
      });
    }
    setActiveSuggestion(null);
    setCurrentEvent(null);
  }, [activeSuggestion, currentEvent]);

  const dismissSuggestion = useCallback(() => {
    if (activeSuggestion && currentEvent) {
      recordCoachOutcome({
        suggestionId: activeSuggestion.id,
        eventId: currentEvent.id,
        userId: currentEvent.userId,
        dealerId: currentEvent.dealerId,
        outcome: 'dismissed',
        occurredAt: new Date().toISOString(),
      });
    }
    setActiveSuggestion(null);
    setCurrentEvent(null);
  }, [activeSuggestion, currentEvent]);

  const recordOutcome = useCallback((outcome: CoachOutcome) => {
    if (activeSuggestion && currentEvent) {
      recordCoachOutcome({
        suggestionId: activeSuggestion.id,
        eventId: currentEvent.id,
        userId: currentEvent.userId,
        dealerId: currentEvent.dealerId,
        outcome,
        occurredAt: new Date().toISOString(),
      });
    }
  }, [activeSuggestion, currentEvent]);

  return (
    <CoachContext.Provider
      value={{
        activeSuggestion,
        showCoach,
        acceptSuggestion,
        dismissSuggestion,
        recordOutcome,
      }}
    >
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error('useCoach must be used within CoachProvider');
  }
  return context;
}

/**
 * Hook to emit coach events from components
 */
export function useCoachEvent() {
  const { showCoach } = useCoach();

  const emitEvent = useCallback(
    (event: Omit<CoachEvent, 'id' | 'occurredAt'>) => {
      const fullEvent: CoachEvent = {
        ...event,
        id: `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        occurredAt: new Date().toISOString(),
      };
      showCoach(fullEvent);
    },
    [showCoach]
  );

  return { emitEvent };
}

