# Onboarding + Stripe Integration Guide

**Date**: November 3, 2025
**Integration**: Clerk Authentication + Stripe Billing + Smart Onboarding
**Status**: Ready to Implement

---

## Executive Summary

Your onboarding infrastructure is **excellent** but currently **disabled**. This guide shows how to activate it and integrate with your new Clerk + Stripe authentication/billing system for a seamless signup → payment → onboarding flow.

---

## Current Assets (What You Have)

### 🎯 Onboarding Components (Ready to Use!)

1. **[SmartPreOnboarding.tsx](app/components/onboarding/SmartPreOnboarding.tsx)** - Animated welcome screen
2. **[PLGEnticement.tsx](app/components/onboarding/PLGEnticement.tsx)** - Conversion optimization
3. **[SmartProgressTracker.tsx](app/components/onboarding/SmartProgressTracker.tsx)** - Gamified progress
4. **[SmartAIAgent.tsx](app/components/onboarding/SmartAIAgent.tsx)** - AI-powered guidance
5. **[SmartHelpSystem.tsx](app/components/onboarding/SmartHelpSystem.tsx)** - Contextual help
6. **[SmartCompletion.tsx](app/components/onboarding/SmartCompletion.tsx)** - Success celebration

### 🧠 Intelligence Layer

- **[personalization-engine.ts](lib/onboarding/personalization-engine.ts)** - Market-specific messaging
- **[ai-recommendation-engine.ts](lib/onboarding/ai-recommendation-engine.ts)** - Smart suggestions

### 📊 API Endpoints

- `/api/onboarding/analyze` - Domain analysis
- `/api/onboarding/progress` - Progress tracking

### ⚠️ Current State

All onboarding routes are **disabled**:
- `app/onboarding/_quick-disabled/`
- `app/onboarding/_landing-disabled/`
- `app/onboarding/_agent-disabled/`

---

## Integration Strategy

### The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   User Signup Journey                       │
└─────────────────────────────────────────────────────────────┘

1. Marketing Site → Click "Get Started"
                     ↓
2. Stripe Checkout → Enter payment info
   - Professional: $499/month
   - Enterprise: $999/month
   - 14-day free trial
                     ↓
3. Clerk Sign-Up → Create account
   - Email + password
   - Or Google/Microsoft OAuth
                     ↓
4. Clerk Webhook → Create Stripe customer
   - Automatically links accounts
   - Saves subscription data
                     ↓
5. Stripe Success → Redirect to onboarding
   URL: /onboarding?session_id={CHECKOUT_SESSION_ID}
                     ↓
6. 🎉 ONBOARDING EXPERIENCE 🎉
   ↓                     ↓                    ↓
Step 1:           Step 2:              Step 3:
Welcome           Domain Setup         Integrations
(30s)             (2 min)              (3-5 min)
   ↓                     ↓                    ↓
Step 4:           Step 5:              Complete!
Competitors       First Insights       → Dashboard
(1 min)           (2 min)
                     ↓
Total Time: 8-11 minutes
Target Completion: >85%
```

---

## Implementation Steps

### Step 1: Create Main Onboarding Route

**File**: `app/onboarding/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SmartPreOnboarding from '@/app/components/onboarding/SmartPreOnboarding';
import OnboardingFlow from '@/app/components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [sessionData, setSessionData] = useState(null);
  const [showPreOnboarding, setShowPreOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Stripe session data
  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const res = await fetch(`/api/onboarding/session?session_id=${sessionId}`);
      const data = await res.json();
      setSessionData(data);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = () => {
    setShowPreOnboarding(false);
  };

  if (!isLoaded || isLoading) {
    return <LoadingScreen />;
  }

  if (showPreOnboarding) {
    return (
      <SmartPreOnboarding
        onStart={handleStartOnboarding}
        userData={{
          name: user?.firstName,
          company: sessionData?.dealership?.company,
          plan: sessionData?.subscription?.plan || 'Professional'
        }}
      />
    );
  }

  return (
    <OnboardingFlow
      user={user}
      sessionData={sessionData}
    />
  );
}
```

### Step 2: Create Session Data API

**File**: `app/api/onboarding/session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Get Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Return combined data
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: session.metadata?.plan,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        currentPeriodEnd: subscription.current_period_end,
      },
      dealership: {
        domain: session.metadata?.domain,
        company: session.metadata?.company,
      },
      customer: {
        id: session.customer,
        email: (session.customer_details as any)?.email,
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
```

### Step 3: Create Onboarding Flow Component

**File**: `app/components/onboarding/OnboardingFlow.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SmartProgressTracker from './SmartProgressTracker';
import PLGEnticement from './PLGEnticement';

const STEPS = [
  { id: 'welcome', title: 'Welcome', duration: '30s' },
  { id: 'domain', title: 'Domain Setup', duration: '2 min' },
  { id: 'integrations', title: 'Connect Data', duration: '3-5 min' },
  { id: 'competitors', title: 'Competitors', duration: '1 min' },
  { id: 'insights', title: 'First Insights', duration: '2 min' },
];

export default function OnboardingFlow({ user, sessionData }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleComplete = async () => {
    // Save completion to database
    await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        sessionId: sessionData?.subscription?.id,
      })
    });

    // Redirect to dashboard
    router.push('/dashboard?onboarded=true');
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <SmartProgressTracker
        currentStep={currentStep}
        totalSteps={STEPS.length}
        progress={progress}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Render current step component */}
        {currentStep === 0 && <StepWelcome {...sessionData} />}
        {currentStep === 1 && <StepDomain />}
        {currentStep === 2 && <StepIntegrations />}
        {currentStep === 3 && <StepCompetitors />}
        {currentStep === 4 && <StepInsights onComplete={handleComplete} />}

        {/* PLG Enticement */}
        {currentStep === 2 && (
          <PLGEnticement
            type="integration"
            connectedCount={2}
            totalCount={5}
          />
        )}
      </div>
    </div>
  );
}
```

### Step 4: Update Stripe Checkout Success URL

**File**: `app/api/stripe/create-checkout/route.ts`

Update line 75:

```typescript
// Before:
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,

// After (if not already set):
success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com'}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
```

This is already correct in your file! ✅

---

## Database Schema

Add onboarding tracking to Supabase:

```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,

  -- Progress
  current_step INTEGER DEFAULT 0,
  steps_completed INTEGER[] DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,

  -- Session data
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  subscription_plan TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE,

  -- Dealership data
  domain TEXT,
  company_name TEXT,
  initial_ai_score DECIMAL(5,2),

  -- Integrations
  connected_integrations JSONB DEFAULT '[]',

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_step_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_onboarding UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_onboarding_user ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_incomplete ON onboarding_progress(completion_percentage)
  WHERE completion_percentage < 100;
```

---

## Enhancements to Add

### 1. Trial Countdown Timer

Show remaining trial days during onboarding:

```typescript
const trialDaysLeft = Math.ceil(
  (sessionData.subscription.trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
);

<div className="text-center mb-4">
  <span className="text-sm text-white/60">
    🎁 {trialDaysLeft} days left in your free trial
  </span>
</div>
```

### 2. Progress Persistence

Auto-save progress at each step:

```typescript
const saveProgress = async (step: number) => {
  await fetch('/api/onboarding/progress', {
    method: 'POST',
    body: JSON.stringify({
      currentStep: step,
      completion: (step / STEPS.length) * 100
    })
  });
};
```

### 3. Resume Capability

Check for incomplete onboarding on dashboard load:

```typescript
// In dashboard layout or page
const checkOnboardingStatus = async () => {
  const res = await fetch('/api/onboarding/status');
  const { completed, progress } = await res.json();

  if (!completed && progress > 0) {
    // Show modal: "Resume onboarding?"
  }
};
```

### 4. Plan-Specific Features

Show different features based on subscription plan:

```typescript
if (sessionData.subscription.plan === 'enterprise') {
  // Show advanced integrations
  // Show API access setup
  // Show white-label options
}
```

---

## Testing Checklist

- [ ] Complete checkout with test card: `4242 4242 4242 4242`
- [ ] Verify redirect to `/onboarding?session_id=xxx`
- [ ] Confirm user data loads correctly
- [ ] Test each onboarding step
- [ ] Verify progress saves on each step
- [ ] Test skip/finish later functionality
- [ ] Confirm completion redirects to dashboard
- [ ] Verify onboarding status saved in database

---

## Quick Wins (Implement These First)

### Win 1: Activate Existing Onboarding (15 min)

```bash
# Rename disabled onboarding
mv app/onboarding/_quick-disabled app/onboarding/quick

# Test locally
npm run dev
# Visit: http://localhost:3000/onboarding/quick
```

### Win 2: Add Session Integration (30 min)

- Create `/api/onboarding/session/route.ts`
- Fetch session data in onboarding page
- Pass data to components

### Win 3: Connect to Stripe Success (5 min)

Already done! Your checkout already redirects to `/onboarding?session_id={CHECKOUT_SESSION_ID}` ✅

---

## Expected Results

### Completion Rates
- **Current**: 0% (disabled)
- **Target**: 85%+
- **Industry Average**: 60-70%

### Time to Value
- **Target**: <5 minutes until first insights
- **Current Best**: 8-11 minutes

### Trial Conversion
- **Target**: 40%+ trial → paid
- **Industry Average**: 25%

---

## Next Steps

1. **Choose Implementation Approach**:
   - Option A: Activate existing `_quick-disabled` (fastest)
   - Option B: Create new integrated flow (recommended)
   - Option C: Hybrid approach

2. **Integrate Session Data**:
   - Create `/api/onboarding/session` endpoint
   - Fetch Stripe + Clerk data
   - Pass to onboarding components

3. **Test End-to-End**:
   - Signup → Payment → Onboarding → Dashboard
   - Verify all data flows correctly

4. **Monitor & Optimize**:
   - Track completion rates
   - Identify drop-off points
   - A/B test improvements

---

**Ready to activate your onboarding?** Choose your approach and I'll help implement it!
