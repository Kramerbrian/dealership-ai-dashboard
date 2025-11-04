'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { ga } from '@/lib/ga';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface ProductTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
}

export function ProductTour({
  steps,
  onComplete,
  onSkip,
  autoStart = false,
  showProgress = true
}: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const startTour = () => {
    setCurrentStep(0);
    setIsVisible(true);
    if (typeof window !== 'undefined' && window.gtag) {
      ga('tour_started', { total_steps: steps.length });
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if tour has been completed before
    const tourCompleted = localStorage.getItem('product_tour_completed');
    if (tourCompleted === 'true' && !autoStart) {
      return;
    }

    // Auto-start on first visit
    if (autoStart || !tourCompleted) {
      setTimeout(() => {
        startTour();
      }, 2000); // Wait 2 seconds after page load
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const nextStep = () => {
    if (currentStep === null || currentStep >= steps.length - 1) {
      completeTour();
      return;
    }
    setCurrentStep(currentStep + 1);
    if (typeof window !== 'undefined' && window.gtag) {
      ga('tour_step', { step: currentStep + 1, total_steps: steps.length });
    }
  };

  const prevStep = () => {
    if (currentStep === null || currentStep <= 0) return;
    setCurrentStep(currentStep - 1);
  };

  const skipTour = () => {
    setIsVisible(false);
    setCurrentStep(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('product_tour_skipped', 'true');
      if (window.gtag) {
        ga('tour_skipped', { step: currentStep });
      }
    }
    if (onSkip) onSkip();
  };

  const completeTour = () => {
    setIsVisible(false);
    setCurrentStep(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('product_tour_completed', 'true');
      if (window.gtag) {
        ga('tour_completed', { total_steps: steps.length });
      }
    }
    if (onComplete) onComplete();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (currentStep === null || !isVisible) {
      if (targetRef.current) {
        targetRef.current.style.zIndex = '';
        targetRef.current = null;
      }
      return;
    }

    const step = steps[currentStep];
    const targetElement = document.querySelector(step.target) as HTMLElement;

    if (targetElement) {
      targetRef.current = targetElement;
      
      // Highlight target element
      targetElement.style.zIndex = '9999';
      targetElement.style.position = 'relative';
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait for scroll to complete
      setTimeout(() => {
        // Calculate tooltip position
        const rect = targetElement.getBoundingClientRect();
        const tooltip = document.getElementById('tour-tooltip');
        if (tooltip) {
          const position = step.position || 'bottom';
          let top = 0;
          let left = 0;

          switch (position) {
            case 'top':
              top = rect.top - 20;
              left = rect.left + rect.width / 2;
              break;
            case 'bottom':
              top = rect.bottom + 20;
              left = rect.left + rect.width / 2;
              break;
            case 'left':
              top = rect.top + rect.height / 2;
              left = rect.left - 20;
              break;
            case 'right':
              top = rect.top + rect.height / 2;
              left = rect.right + 20;
              break;
            case 'center':
              top = window.innerHeight / 2;
              left = window.innerWidth / 2;
              break;
          }

          tooltip.style.top = `${top}px`;
          tooltip.style.left = `${left}px`;
          tooltip.style.transform = position === 'center' 
            ? 'translate(-50%, -50%)' 
            : position === 'left' || position === 'right'
            ? 'translateY(-50%)'
            : 'translateX(-50%)';
        }
      }, 500);
    }
  }, [currentStep, isVisible, steps]);

  if (!isVisible || currentStep === null) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={(e) => {
          // Only close if clicking on overlay, not tooltip
          if (e.target === overlayRef.current) {
            skipTour();
          }
        }}
      />

      {/* Highlight Box */}
      {targetRef.current && (
        <div
          className="fixed border-4 border-blue-500 rounded-xl shadow-2xl z-[9999] pointer-events-none"
          style={{
            top: targetRef.current.getBoundingClientRect().top - 4,
            left: targetRef.current.getBoundingClientRect().left - 4,
            width: targetRef.current.getBoundingClientRect().width + 8,
            height: targetRef.current.getBoundingClientRect().height + 8,
            transition: 'all 0.3s ease-out'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        id="tour-tooltip"
        className="fixed z-[10000] w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-scale-in"
        style={{
          maxWidth: '90vw'
        }}
      >
        {/* Progress Bar */}
        {showProgress && (
          <div className="h-1 bg-gray-200 rounded-t-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{step.title}</h3>
                {showProgress && (
                  <p className="text-xs text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={skipTour}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{step.content}</p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={completeTour}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

