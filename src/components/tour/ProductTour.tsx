"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  Star,
  Target,
  BarChart3,
  Users,
  Settings,
  HelpCircle
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'scroll';
  highlight?: boolean;
  videoUrl?: string;
  interactive?: boolean;
  tips?: string[];
}

interface TourProgress {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  startTime: Date;
  endTime?: Date;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DealershipAI!',
    description: 'Let\'s take a quick tour of your new AI-powered dashboard. This will help you get the most out of your visibility analytics.',
    target: '.dashboard-header',
    position: 'bottom',
    tips: ['You can skip this tour anytime', 'Use the arrow keys to navigate', 'Click on highlighted elements to interact']
  },
  {
    id: 'aiv-overview',
    title: 'AIV Score Overview',
    description: 'Your Algorithmic Visibility Index (AIV) is your key performance metric. It combines SEO, advertising, and engagement data into a single score.',
    target: '.aiv-metrics-panel',
    position: 'right',
    action: 'click',
    highlight: true,
    tips: ['Higher AIV scores mean better visibility', 'Track trends over time', 'Compare with industry benchmarks']
  },
  {
    id: 'reputation-engine',
    title: 'Reputation Management',
    description: 'Monitor and respond to reviews across all platforms. Our AI helps you maintain a positive online presence.',
    target: '.reputation-engine',
    position: 'left',
    action: 'click',
    highlight: true,
    tips: ['Respond to reviews within 24 hours', 'Use different tones for different situations', 'Monitor sentiment trends']
  },
  {
    id: 'predictive-insights',
    title: 'AI-Powered Insights',
    description: 'Get predictive analytics and actionable recommendations to improve your dealership\'s performance.',
    target: '.predictive-insights',
    position: 'top',
    action: 'click',
    highlight: true,
    tips: ['Check insights daily for new opportunities', 'High confidence scores are most reliable', 'Take action on high-impact recommendations']
  },
  {
    id: 'what-if-simulator',
    title: 'What-If Simulator',
    description: 'Test different scenarios to see how changes might impact your business. Perfect for planning and budgeting.',
    target: '.what-if-simulator',
    position: 'bottom',
    action: 'click',
    highlight: true,
    tips: ['Save scenarios for comparison', 'Share results with your team', 'Use for budget planning']
  },
  {
    id: 'team-management',
    title: 'Team Collaboration',
    description: 'Assign tasks, track progress, and keep your team aligned with your visibility goals.',
    target: '.team-management',
    position: 'right',
    action: 'click',
    highlight: true,
    tips: ['Set clear deadlines for tasks', 'Use @mentions to notify team members', 'Track completion rates']
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Configure notifications, set up integrations, and personalize your dashboard to match your workflow.',
    target: '.settings-panel',
    position: 'left',
    action: 'click',
    highlight: true,
    tips: ['Set up email notifications', 'Connect your social media accounts', 'Customize your dashboard layout']
  },
  {
    id: 'completion',
    title: 'Tour Complete!',
    description: 'You\'re all set! Start exploring your dashboard and don\'t hesitate to use the help system if you need assistance.',
    target: '.dashboard-header',
    position: 'bottom',
    tips: ['Bookmark this dashboard', 'Set up your first campaign', 'Join our community for tips and support']
  }
];

export default function ProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<TourProgress>({
    currentStep: 0,
    completedSteps: [],
    skippedSteps: [],
    startTime: new Date()
  });
  const [isPaused, setIsPaused] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  useEffect(() => {
    // Check if user has completed the tour before
    const hasCompletedTour = localStorage.getItem('dealership-ai-tour-completed');
    if (!hasCompletedTour) {
      // Auto-start tour for new users
      setTimeout(() => {
        startTour();
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if (isActive && currentStep) {
      highlightElement(currentStep.target);
    }
  }, [isActive, currentStepIndex]);

  const startTour = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setProgress({
      currentStep: 0,
      completedSteps: [],
      skippedSteps: [],
      startTime: new Date()
    });
    setShowTips(false);
  };

  const endTour = () => {
    setIsActive(false);
    setProgress(prev => ({
      ...prev,
      endTime: new Date()
    }));
    localStorage.setItem('dealership-ai-tour-completed', 'true');
    removeHighlight();
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setProgress(prev => ({
        ...prev,
        currentStep: currentStepIndex + 1,
        completedSteps: [...prev.completedSteps, currentStepIndex]
      }));
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setProgress(prev => ({
        ...prev,
        currentStep: currentStepIndex - 1
      }));
    }
  };

  const skipStep = () => {
    setProgress(prev => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps, currentStepIndex]
    }));
    nextStep();
  };

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element && spotlightRef.current) {
      const rect = element.getBoundingClientRect();
      const spotlight = spotlightRef.current;
      
      spotlight.style.left = `${rect.left}px`;
      spotlight.style.top = `${rect.top}px`;
      spotlight.style.width = `${rect.width}px`;
      spotlight.style.height = `${rect.height}px`;
      spotlight.style.display = 'block';
      
      // Add pulsing animation
      element.classList.add('tour-highlight');
    }
  };

  const removeHighlight = () => {
    const highlightedElements = document.querySelectorAll('.tour-highlight');
    highlightedElements.forEach(el => el.classList.remove('tour-highlight'));
    if (spotlightRef.current) {
      spotlightRef.current.style.display = 'none';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive) return;
    
    switch (e.key) {
      case 'Escape':
        endTour();
        break;
      case 'ArrowRight':
        nextStep();
        break;
      case 'ArrowLeft':
        prevStep();
        break;
      case ' ':
        e.preventDefault();
        setIsPaused(!isPaused);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isPaused]);

  if (!isActive) {
    return (
      <Button
        onClick={startTour}
        variant="outline"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        Take Tour
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={endTour}
      />
      
      {/* Spotlight */}
      <div
        ref={spotlightRef}
        className="fixed z-45 pointer-events-none border-2 border-blue-500 rounded-lg shadow-lg"
        style={{ display: 'none' }}
      />

      {/* Tour Card */}
      <div className="fixed z-50 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTips(!showTips)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={endTour}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
              <p className="text-gray-600 mb-4">{currentStep.description}</p>
              
              {showTips && currentStep.tips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Pro Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {currentStep.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStep.videoUrl && (
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Play className="h-4 w-4" />
                    Watch tutorial video
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={skipStep}
                >
                  Skip
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={nextStep}
                >
                  {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>← → Navigate</span>
                <span>Space Pause</span>
                <span>Esc Exit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tour Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 46;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </>
  );
}
