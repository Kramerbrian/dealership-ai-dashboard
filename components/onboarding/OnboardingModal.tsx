'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { OnboardingFlow } from '@/components/OnboardingFlow';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  onSkip 
}: OnboardingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    onSkip?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="onboarding-modal relative">
        {/* Header */}
        <div className="onboarding-modal-header">
          <div>
            <h2 className="onboarding-modal-title">
              Welcome to DealershipAI
            </h2>
            <p className="onboarding-modal-subtitle">
              Let's get your dealership set up in just a few minutes
            </p>
          </div>
          <button
            onClick={onClose}
            className="onboarding-close-button"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="onboarding-step-content">
          <OnboardingFlow 
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        </div>
      </div>
    </div>
  );
}

