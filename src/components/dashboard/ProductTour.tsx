/**
 * Guided Product Tour
 * Interactive tour highlighting key dashboard features
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  X, 
  Eye, 
  Brain, 
  MessageSquare, 
  Target,
  Zap,
  Star,
  TrendingUp,
  Settings
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  content: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'overview',
    title: 'Welcome to Your AI Command Center',
    description: 'Your dashboard overview with real-time metrics',
    target: '[data-tour="overview"]',
    position: 'bottom',
    content: 'This is your mission control. Here you can see your AIV score, visibility risk, revenue impact, and active users at a glance.',
    icon: <Eye className="h-5 w-5" />,
  },
  {
    id: 'insights',
    title: 'AI-Powered Insights',
    description: 'Predictive analytics and recommendations',
    target: '[data-tour="insights"]',
    position: 'bottom',
    content: 'Our AI analyzes your data and provides actionable insights. You\'ll see forecasts, trends, and specific recommendations to improve your visibility.',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: 'reputation',
    title: 'Reputation Engine',
    description: 'AI-powered review management',
    target: '[data-tour="reputation"]',
    position: 'bottom',
    content: 'The reputation engine automatically monitors your reviews and can generate witty, professional, or friendly responses. Try the "Engage Ludicrous Mode" button!',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: 'whatif',
    title: 'What-If Simulator',
    description: 'Test strategic scenarios',
    target: '[data-tour="whatif"]',
    position: 'bottom',
    content: 'Simulate different strategies like FAQ schema deployment, PPC campaigns, or video testimonials to see their projected impact on traffic, leads, and revenue.',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'actions',
    title: 'Quick Actions',
    description: 'One-click solutions for common tasks',
    target: '[data-tour="actions"]',
    position: 'top',
    content: 'These quick action buttons let you fix SEO issues, deploy schema markup, respond to reviews, and generate reports with a single click.',
    icon: <Zap className="h-5 w-5" />,
  },
];

export default function ProductTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    // Check if tour has been completed before
    const tourCompleted = localStorage.getItem('dealershipai-tour-completed');
    if (tourCompleted) {
      setTourCompleted(true);
    }
  }, []);

  useEffect(() => {
    // Auto-start tour for new users
    if (!tourCompleted && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tourCompleted, isOpen]);

  const currentStepData = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    setTourCompleted(true);
    localStorage.setItem('dealershipai-tour-completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  const startTour = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsOpen(true);
  };

  if (tourCompleted && !isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={startTour}
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4 mr-2" />
        Take Tour Again
      </Button>
    );
  }

  return (
    <>
      {/* Tour Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-0">
            {/* Highlight current target */}
            {currentStepData && (
              <div
                className="absolute border-2 border-blue-500 rounded-lg shadow-lg bg-blue-500 bg-opacity-10"
                style={{
                  // This would be calculated based on the target element's position
                  // For now, we'll use a placeholder
                  top: '20%',
                  left: '20%',
                  width: '60%',
                  height: '60%',
                }}
              />
            )}
          </div>

          {/* Tour Dialog */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {currentStepData?.icon}
                    <DialogTitle className="text-lg">{currentStepData?.title}</DialogTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DialogDescription>
                  {currentStepData?.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Step {currentStep + 1} of {TOUR_STEPS.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Content */}
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm">{currentStepData?.content}</p>
                  </CardContent>
                </Card>

                {/* Completed Steps */}
                {completedSteps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Completed:</p>
                    <div className="flex flex-wrap gap-1">
                      {completedSteps.map((stepIndex) => (
                        <Badge key={stepIndex} variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {TOUR_STEPS[stepIndex].title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={handleSkip}>
                      Skip Tour
                    </Button>
                    <Button onClick={handleNext}>
                      {currentStep === TOUR_STEPS.length - 1 ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Tour Start Button for New Users */}
      {!tourCompleted && !isOpen && (
        <Button
          onClick={startTour}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Star className="h-4 w-4 mr-2" />
          Take Product Tour
        </Button>
      )}
    </>
  );
}
