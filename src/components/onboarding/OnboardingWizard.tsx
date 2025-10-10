/**
 * Intelligent Onboarding Wizard
 * Gamified, witty onboarding experience with progress tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Zap, 
  Brain, 
  Target, 
  Users, 
  Settings, 
  CheckCircle, 
  Rocket,
  Trophy,
  Star,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  SkipForward
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  wittyMessage: string;
  badge?: string;
  required: boolean;
}

interface OnboardingData {
  dealershipInfo: {
    name: string;
    website: string;
    location: string;
    phone: string;
    description: string;
  };
  connectedAccounts: {
    googleBusiness: boolean;
    analytics: boolean;
    socialMedia: boolean;
    crm: boolean;
  };
  teamMembers: Array<{
    email: string;
    role: string;
    name: string;
  }>;
  plan: 'starter' | 'professional' | 'enterprise';
  tone: 'witty' | 'professional' | 'friendly';
  preferences: {
    notifications: boolean;
    weeklyReports: boolean;
    aiInsights: boolean;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Future',
    description: 'Let\'s get your dealership AI-powered in minutes',
    wittyMessage: 'Warming up the AI engines...',
    badge: 'First Contact',
    required: true,
  },
  {
    id: 'dealership',
    title: 'Tell Us About Your Dealership',
    description: 'Help us understand your business',
    wittyMessage: 'Connecting AI sensors to your dealership...',
    badge: 'Dealership Detected',
    required: true,
  },
  {
    id: 'connections',
    title: 'Connect Your Data Sources',
    description: 'Link your accounts for better insights',
    wittyMessage: 'Syncing with the mothership...',
    badge: 'Data Pipeline Established',
    required: false,
  },
  {
    id: 'team',
    title: 'Invite Your Team',
    description: 'Get your crew on board',
    wittyMessage: 'Assembling the Avengers...',
    badge: 'Team Assembled',
    required: false,
  },
  {
    id: 'plan',
    title: 'Choose Your Power Level',
    description: 'Select the plan that fits your needs',
    wittyMessage: 'Calibrating your AI arsenal...',
    badge: 'Power Level Set',
    required: true,
  },
  {
    id: 'preferences',
    title: 'Customize Your Experience',
    description: 'Set your preferences and tone',
    wittyMessage: 'Fine-tuning your AI personality...',
    badge: 'Personality Installed',
    required: true,
  },
  {
    id: 'success',
    title: 'Welcome Aboard, Commander!',
    description: 'Your AI-powered dealership is ready',
    wittyMessage: 'All systems operational. Welcome to the future!',
    badge: 'Mission Complete',
    required: true,
  },
];

export default function OnboardingWizard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    dealershipInfo: {
      name: '',
      website: '',
      location: '',
      phone: '',
      description: '',
    },
    connectedAccounts: {
      googleBusiness: false,
      analytics: false,
      socialMedia: false,
      crm: false,
    },
    teamMembers: [],
    plan: 'starter',
    tone: 'professional',
    preferences: {
      notifications: true,
      weeklyReports: true,
      aiInsights: true,
    },
  });

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    setProgress((currentStep / (ONBOARDING_STEPS.length - 1)) * 100);
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
      if (currentStepData.badge && !earnedBadges.includes(currentStepData.badge)) {
        setEarnedBadges([...earnedBadges, currentStepData.badge]);
        toast.success(`Badge earned: ${currentStepData.badge}!`, {
          description: currentStepData.wittyMessage,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (!currentStepData.required) {
      toast.info('Step skipped!', {
        description: 'You can always come back to this later in settings.',
      });
      handleNext();
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data via tRPC
      const response = await fetch('/api/trpc/onboarding.complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: onboardingData,
          badges: earnedBadges,
        }),
      });

      if (response.ok) {
        toast.success('Welcome aboard, Commander!', {
          description: 'Your AI-powered dealership is ready for action!',
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('https://dash.dealershipai.com');
        }, 2000);
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      toast.error('Something went wrong!', {
        description: 'Please try again or contact support.',
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to DealershipAI</h2>
              <p className="text-gray-600 mb-4">
                The most advanced AI-powered visibility engine for automotive dealerships
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  <span>AI Insights</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Target className="w-6 h-6 text-green-600" />
                  <span>Predictive Analytics</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                  <span>Real-time Data</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'dealership':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Dealership Name *</Label>
                <Input
                  id="name"
                  value={onboardingData.dealershipInfo.name}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    dealershipInfo: { ...onboardingData.dealershipInfo, name: e.target.value }
                  })}
                  placeholder="e.g., Naples Ford"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={onboardingData.dealershipInfo.website}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    dealershipInfo: { ...onboardingData.dealershipInfo, website: e.target.value }
                  })}
                  placeholder="https://yourdealership.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={onboardingData.dealershipInfo.location}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    dealershipInfo: { ...onboardingData.dealershipInfo, location: e.target.value }
                  })}
                  placeholder="City, State"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={onboardingData.dealershipInfo.phone}
                  onChange={(e) => setOnboardingData({
                    ...onboardingData,
                    dealershipInfo: { ...onboardingData.dealershipInfo, phone: e.target.value }
                  })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={onboardingData.dealershipInfo.description}
                onChange={(e) => setOnboardingData({
                  ...onboardingData,
                  dealershipInfo: { ...onboardingData.dealershipInfo, description: e.target.value }
                })}
                placeholder="Tell us about your dealership..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'connections':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Connect your accounts to unlock powerful AI insights. More data = better predictions!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="googleBusiness"
                    checked={onboardingData.connectedAccounts.googleBusiness}
                    onCheckedChange={(checked) => setOnboardingData({
                      ...onboardingData,
                      connectedAccounts: { ...onboardingData.connectedAccounts, googleBusiness: !!checked }
                    })}
                  />
                  <div>
                    <Label htmlFor="googleBusiness" className="font-medium">Google Business Profile</Label>
                    <p className="text-sm text-gray-500">Local SEO & reviews</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="analytics"
                    checked={onboardingData.connectedAccounts.analytics}
                    onCheckedChange={(checked) => setOnboardingData({
                      ...onboardingData,
                      connectedAccounts: { ...onboardingData.connectedAccounts, analytics: !!checked }
                    })}
                  />
                  <div>
                    <Label htmlFor="analytics" className="font-medium">Google Analytics</Label>
                    <p className="text-sm text-gray-500">Traffic & conversion data</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="socialMedia"
                    checked={onboardingData.connectedAccounts.socialMedia}
                    onCheckedChange={(checked) => setOnboardingData({
                      ...onboardingData,
                      connectedAccounts: { ...onboardingData.connectedAccounts, socialMedia: !!checked }
                    })}
                  />
                  <div>
                    <Label htmlFor="socialMedia" className="font-medium">Social Media</Label>
                    <p className="text-sm text-gray-500">Facebook, Instagram, etc.</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="crm"
                    checked={onboardingData.connectedAccounts.crm}
                    onCheckedChange={(checked) => setOnboardingData({
                      ...onboardingData,
                      connectedAccounts: { ...onboardingData.connectedAccounts, crm: !!checked }
                    })}
                  />
                  <div>
                    <Label htmlFor="crm" className="font-medium">CRM System</Label>
                    <p className="text-sm text-gray-500">Customer data & leads</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Invite your team members to collaborate on your AI-powered dealership
              </p>
            </div>
            <div className="space-y-4">
              {onboardingData.teamMembers.map((member, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const newMembers = [...onboardingData.teamMembers];
                        newMembers[index].name = e.target.value;
                        setOnboardingData({ ...onboardingData, teamMembers: newMembers });
                      }}
                    />
                    <Input
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => {
                        const newMembers = [...onboardingData.teamMembers];
                        newMembers[index].email = e.target.value;
                        setOnboardingData({ ...onboardingData, teamMembers: newMembers });
                      }}
                    />
                    <Select
                      value={member.role}
                      onValueChange={(value) => {
                        const newMembers = [...onboardingData.teamMembers];
                        newMembers[index].role = value;
                        setOnboardingData({ ...onboardingData, teamMembers: newMembers });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={() => setOnboardingData({
                  ...onboardingData,
                  teamMembers: [...onboardingData.teamMembers, { name: '', email: '', role: 'user' }]
                })}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          </div>
        );

      case 'plan':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Choose the plan that matches your dealership's ambitions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`p-6 cursor-pointer transition-all ${
                  onboardingData.plan === 'starter' ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setOnboardingData({ ...onboardingData, plan: 'starter' })}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Starter</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                  <div className="text-3xl font-bold">$99<span className="text-sm font-normal">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Basic AI insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Up to 3 users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Email support</span>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`p-6 cursor-pointer transition-all ${
                  onboardingData.plan === 'professional' ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setOnboardingData({ ...onboardingData, plan: 'professional' })}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Professional</CardTitle>
                  <CardDescription>For growing dealerships</CardDescription>
                  <div className="text-3xl font-bold">$299<span className="text-sm font-normal">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Advanced AI insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Up to 10 users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`p-6 cursor-pointer transition-all ${
                  onboardingData.plan === 'enterprise' ? 'ring-2 ring-purple-600 bg-purple-50' : ''
                }`}
                onClick={() => setOnboardingData({ ...onboardingData, plan: 'enterprise' })}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg flex items-center justify-center space-x-2">
                    <span>Enterprise</span>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </CardTitle>
                  <CardDescription>Need ludicrous mode? Upgrade to Enterprise.</CardDescription>
                  <div className="text-3xl font-bold">$999<span className="text-sm font-normal">/mo</span></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Ludicrous mode AI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Unlimited users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">24/7 support</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Response Tone</Label>
              <p className="text-sm text-gray-600 mb-4">Choose how AI responds to reviews and communications</p>
              <Tabs value={onboardingData.tone} onValueChange={(value) => setOnboardingData({ ...onboardingData, tone: value as any })}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="friendly">Friendly</TabsTrigger>
                  <TabsTrigger value="witty">Witty</TabsTrigger>
                </TabsList>
                <TabsContent value="professional" className="mt-4">
                  <Card className="p-4">
                    <p className="text-sm text-gray-600">
                      "Thank you for your feedback. We appreciate your business and will work to improve our service."
                    </p>
                  </Card>
                </TabsContent>
                <TabsContent value="friendly" className="mt-4">
                  <Card className="p-4">
                    <p className="text-sm text-gray-600">
                      "Thanks so much for taking the time to share your experience! We'd love to make things right."
                    </p>
                  </Card>
                </TabsContent>
                <TabsContent value="witty" className="mt-4">
                  <Card className="p-4">
                    <p className="text-sm text-gray-600">
                      "Well, that's not the review we were hoping for! 😅 Let's turn this frown upside down together."
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Notification Preferences</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="notifications"
                    checked={onboardingData.preferences.notifications}
                    onCheckedChange={(checked) => setOnboardingData({
                      ...onboardingData,
                      preferences: { ...onboardingData.preferences, notifications: !!checked }
                    })}
                  />
                  <Label htmlFor="notifications">Real-time notifications</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="weeklyReports"
                    checked={onboardingData.preferences.weeklyReports}
                    onCheckedChange={(checked) => setOnboardingData({
                      ...onboardingData,
                      preferences: { ...onboardingData.preferences, weeklyReports: !!checked }
                    })}
                  />
                  <Label htmlFor="weeklyReports">Weekly performance reports</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="aiInsights"
                    checked={onboardingData.preferences.aiInsights}
                    onCheckedChange={(checked) => setOnboardingData({
                      ...onboardingData,
                      preferences: { ...onboardingData.preferences, aiInsights: !!checked }
                    })}
                  />
                  <Label htmlFor="aiInsights">AI insights and recommendations</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome Aboard, Commander!</h2>
              <p className="text-gray-600 mb-6">
                Your AI-powered dealership is ready for action. Let's make some magic happen!
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col items-center space-y-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span>AI Insights Active</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Target className="w-6 h-6 text-green-600" />
                  <span>Predictions Ready</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Badges Earned:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {earnedBadges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="flex items-center space-x-1">
                    <Trophy className="w-3 h-3" />
                    <span>{badge}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
            {currentStepData.wittyMessage && (
              <div className="mt-2 text-sm text-blue-600 font-medium">
                {currentStepData.wittyMessage}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {!currentStepData.required && !isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Dashboard
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
