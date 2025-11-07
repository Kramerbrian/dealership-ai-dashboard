/**
 * React Hook for Pulse System Integration
 * 
 * Connects I2E components to Pulse API
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSnapshot, 
  applyFix, 
  postRecommendation, 
  postReceipt,
  type PulseSnapshot 
} from './api-client';
import {
  pulsesToUpdateCards,
  pulsesToCorrections,
  pulsesToACNs,
  pulseToPlaybook,
  scoresToUpdateCards
} from './pulse-integration';
import { UpdateCard, OneClickCorrection, ActionableContextualNugget, ExecutionPlaybook } from './types';

export function usePulseIntegration() {
  const queryClient = useQueryClient();
  const [selectedPlaybook, setSelectedPlaybook] = useState<ExecutionPlaybook | null>(null);
  const [playbookOpen, setPlaybookOpen] = useState(false);

  // Fetch snapshot
  const { data: snapshot, isLoading, error, refetch } = useQuery({
    queryKey: ['pulse-snapshot'],
    queryFn: getSnapshot,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });

  // Mutations
  const fixMutation = useMutation({
    mutationFn: applyFix,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-snapshot'] });
    },
  });

  const recommendationMutation = useMutation({
    mutationFn: postRecommendation,
  });

  const receiptMutation = useMutation({
    mutationFn: postReceipt,
  });

  // Convert snapshot to I2E formats
  const updates = snapshot 
    ? [...pulsesToUpdateCards(snapshot), ...scoresToUpdateCards(snapshot)]
    : [];

  const corrections = snapshot 
    ? pulsesToCorrections(snapshot)
    : [];

  const acns = snapshot 
    ? pulsesToACNs(snapshot)
    : [];

  // Handle ACN action - opens playbook
  const handleACNAction = useCallback(async (pulseId: string) => {
    if (!snapshot) return;

    const pulse = snapshot.pulses_closed.find(p => p.id === pulseId);
    if (!pulse) return;

    const playbook = pulseToPlaybook(pulse, snapshot);
    setSelectedPlaybook(playbook);
    setPlaybookOpen(true);
  }, [snapshot]);

  // Handle correction execution
  const handleCorrectionExecute = useCallback(async (pulseId: string) => {
    try {
      await fixMutation.mutateAsync({
        pulseId,
        tier: 'apply'
      });
    } catch (error) {
      console.error('Failed to execute correction:', error);
      throw error;
    }
  }, [fixMutation]);

  // Handle playbook step completion
  const handleStepComplete = useCallback((stepId: string) => {
    console.log('Step completed:', stepId);
    // Additional logic if needed
  }, []);

  // Handle playbook completion
  const handlePlaybookComplete = useCallback(async (playbookId: string) => {
    const pulseId = playbookId.replace('playbook-', '');
    
    if (snapshot) {
      const pulse = snapshot.pulses_closed.find(p => p.id === pulseId);
      if (pulse) {
        try {
          await receiptMutation.mutateAsync({
            pulseId,
            deltaUSD: pulse.deltaUSD,
            success: true,
            notes: `Playbook completed successfully`
          });
        } catch (error) {
          console.error('Failed to post receipt:', error);
        }
      }
    }

    // Close playbook after delay
    setTimeout(() => {
      setPlaybookOpen(false);
      setSelectedPlaybook(null);
    }, 2000);
  }, [snapshot, receiptMutation]);

  return {
    // Data
    snapshot,
    updates,
    corrections,
    acns,
    selectedPlaybook,
    playbookOpen,
    
    // State
    isLoading,
    error,
    
    // Actions
    handleACNAction,
    handleCorrectionExecute,
    handleStepComplete,
    handlePlaybookComplete,
    openPlaybook: (playbook: ExecutionPlaybook) => {
      setSelectedPlaybook(playbook);
      setPlaybookOpen(true);
    },
    closePlaybook: () => {
      setPlaybookOpen(false);
      setTimeout(() => setSelectedPlaybook(null), 300);
    },
    refetch,
    
    // Mutations
    applyFix: fixMutation.mutateAsync,
    postRecommendation: recommendationMutation.mutateAsync,
    postReceipt: receiptMutation.mutateAsync,
  };
}

