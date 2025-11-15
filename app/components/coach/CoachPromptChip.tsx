'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface CoachPromptChipProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

/**
 * CoachPromptChip - Subtle hint that Coach is available
 * 
 * Small, unobtrusive chip that indicates Coach can help
 */
export function CoachPromptChip({
  onClick,
  label = 'Need help?',
  className = '',
}: CoachPromptChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors ${className}`}
    >
      <HelpCircle className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}

