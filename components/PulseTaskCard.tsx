'use client';

import { useEffect, useState } from 'react';
import { useLLMJsonStream } from '@/hooks/useLLMJsonStream';
import PulseCardStream from './PulseCardStream';

interface PulseTaskCardProps {
  taskId: string;
  agent: 'aim_gpt' | 'pulse_engine' | 'schema_engine';
  payload: any;
  dealerId: string;
  onComplete?: (result: any) => void;
}

/**
 * PulseTaskCard
 * Automatically starts streaming when a new PulseTask is detected
 */
export default function PulseTaskCard({
  taskId,
  agent,
  payload,
  dealerId,
  onComplete,
}: PulseTaskCardProps) {
  const [autoStarted, setAutoStarted] = useState(false);

  // Auto-start streaming for pulse_engine tasks
  useEffect(() => {
    if (agent === 'pulse_engine' && !autoStarted) {
      setAutoStarted(true);
    }
  }, [agent, autoStarted]);

  if (agent !== 'pulse_engine') {
    return (
      <div className="p-4 border border-gray-700 rounded bg-gray-900 text-gray-100">
        <p className="text-sm text-gray-400">Task: {agent}</p>
        <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(payload, null, 2)}</pre>
      </div>
    );
  }

  // Generate prompt from payload
  const prompt = payload.prompt || 
    `Generate a triage card for dealer ${dealerId}: ${JSON.stringify(payload)}`;

  return (
    <div className="p-4 border border-gray-700 rounded bg-gray-900">
      <div className="mb-2">
        <span className="text-xs text-gray-400">Task ID: {taskId}</span>
      </div>
      <PulseCardStream prompt={prompt} onComplete={onComplete} />
    </div>
  );
}

