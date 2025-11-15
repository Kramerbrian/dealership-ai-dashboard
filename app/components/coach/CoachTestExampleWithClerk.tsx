'use client';

/**
 * Coach Test Example with Clerk Integration
 * 
 * This version uses Clerk hooks and should only be used within ClerkProvider context.
 * For a version that works without Clerk, see CoachTestExample.tsx
 */

import React, { useRef } from 'react';
import { useCoachEvent, useCoach } from '@/hooks/useCoachContext';
import { CoachPopover } from './CoachPopover';
import { useUser } from '@clerk/nextjs';

export function CoachTestExampleWithClerk() {
  const { emitEvent } = useCoachEvent();
  const { activeSuggestion, acceptSuggestion, dismissSuggestion } = useCoach();
  const { user } = useUser();
  const anchorRef = useRef<HTMLButtonElement>(null);

  // Get user context from Clerk
  const dealerId = user?.publicMetadata?.dealer as string || 'test-dealer';
  const userId = user?.id || 'test-user';
  const persona = (user?.publicMetadata?.role as string) || 'sales';

  const testSalesEvent = () => {
    emitEvent({
      dealerId,
      userId,
      persona: 'sales',
      app: 'dash',
      sourceAgent: 'Pulse',
      kind: 'agent_recommendation_ignored',
      context: {
        cardId: 'test-card-123',
        topic: 'trade_followup',
        revenueAtRisk: 750,
      },
    });
  };

  const testManagerEvent = () => {
    emitEvent({
      dealerId,
      userId,
      persona: 'manager',
      app: 'dash',
      sourceAgent: 'AIM',
      kind: 'override_without_reason',
      context: {
        overrideCount: 3,
        vin: 'TEST123456',
      },
    });
  };

  const testComplianceEvent = () => {
    emitEvent({
      dealerId,
      userId,
      persona: 'manager',
      app: 'dash',
      sourceAgent: 'Compliance',
      kind: 'compliance_block_waiting',
      context: {
        blockId: 'block-123',
        minutesWaiting: 6,
      },
    });
  };

  const testFlowAbandoned = () => {
    emitEvent({
      dealerId,
      userId,
      persona: 'sales',
      app: 'dash',
      kind: 'flow_abandoned',
      context: {
        flowType: 'pricing',
        step: 2,
        timeSpent: 120000,
      },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Coach Test Panel (with Clerk)</h2>
      
      <div className="space-y-2">
        <button
          ref={anchorRef}
          onClick={testSalesEvent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Test Sales Event (Trade Follow-up)
        </button>

        <button
          onClick={testManagerEvent}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 block"
        >
          Test Manager Event (AIM Override)
        </button>

        <button
          onClick={testComplianceEvent}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 block"
        >
          Test Compliance Event (Block Waiting)
        </button>

        <button
          onClick={testFlowAbandoned}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 block"
        >
          Test Flow Abandoned
        </button>
      </div>

      {/* Coach Popover */}
      {activeSuggestion && (
        <CoachPopover
          suggestion={activeSuggestion}
          onAccept={acceptSuggestion}
          onDismiss={dismissSuggestion}
          anchorElement={anchorRef.current}
        />
      )}

      {/* Debug info */}
      <div className="mt-6 p-4 bg-slate-100 rounded-lg text-sm">
        <div className="font-semibold mb-2">Current Context:</div>
        <div>Dealer ID: {dealerId}</div>
        <div>User ID: {userId}</div>
        <div>Persona: {persona}</div>
        {user && (
          <div className="mt-2">
            <div className="font-semibold">Clerk User:</div>
            <div>Email: {user.primaryEmailAddress?.emailAddress}</div>
            <div>Name: {user.firstName} {user.lastName}</div>
          </div>
        )}
        {activeSuggestion && (
          <div className="mt-2">
            <div className="font-semibold">Active Suggestion:</div>
            <div>ID: {activeSuggestion.id}</div>
            <div>Title: {activeSuggestion.title}</div>
            <div>Severity: {activeSuggestion.severity}</div>
          </div>
        )}
      </div>
    </div>
  );
}

