# Onboarding Quick Start Guide

**Status**: ✅ Ready to Test
**Implementation Time**: Complete
**Date**: November 3, 2025

---

## What Was Built

### ✅ Complete Onboarding System

1. **[app/onboarding/page.tsx](app/onboarding/page.tsx)** - Main onboarding page
   - Integrates with Stripe checkout
   - Uses SmartPreOnboarding component
   - Shows trial countdown
   - Quick setup form
   - Skip functionality

2. **[app/api/onboarding/session/route.ts](app/api/onboarding/session/route.ts)** - Session data API
   - Fetches Stripe checkout session
   - Returns subscription details
   - Provides dealership metadata
   - Secure user verification

3. **[app/api/onboarding/status/route.ts](app/api/onboarding/status/route.ts)** - Status check API
   - Checks completion status
   - Returns progress percentage
   - Handles missing database gracefully

4. **[app/api/onboarding/complete/route.ts](app/api/onboarding/complete/route.ts)** - Completion API
   - Marks onboarding complete
   - Updates progress (PUT)
   - Saves to Supabase (optional)
   - Graceful error handling

---

## How It Works

### The Complete Flow

```
1. User clicks "Get Started" on marketing site
                ↓
2. Stripe Checkout → User enters payment info
   - Professional: $499/month (14-day trial)
   - Enterprise: $999/month (14-day trial)
                ↓
3. Clerk Sign-Up → User creates account
   - Email + password
   - Or OAuth (Google/Microsoft)
                ↓
4. Clerk Webhook → Creates Stripe customer automatically
                ↓
5. Stripe Success → Redirects to:
   /onboarding?session_id={CHECKOUT_SESSION_ID}
                ↓
6. Onboarding Page Loads:
   - Fetches session data from /api/onboarding/session
   - Displays SmartPreOnboarding welcome screen
   - Shows trial countdown
   - Pre-fills domain and company from session
                ↓
7. User Completes Setup → Clicks "Complete Setup"
   - Calls /api/onboarding/complete
   - Redirects to /dashboard?onboarded=true
```

---

## Testing the Flow

### Test 1: Complete Checkout → Onboarding

```bash
# 1. Start development server
npm run dev

# 2. Navigate to pricing page
open http://localhost:3000/pricing

# 3. Click "Upgrade to Professional"

# 4. Enter Stripe test card
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123

# 5. Complete checkout

# 6. Should redirect to:
# http://localhost:3000/onboarding?session_id=cs_test_...

# 7. Welcome screen appears with:
# - Your name from Clerk
# - Plan name (Professional)
# - Trial countdown

# 8. Click "Let's Get Started"

# 9. Quick setup form with pre-filled data

# 10. Click "Complete Setup"

# 11. Redirects to dashboard
```

### Test 2: Direct Onboarding Access

```bash
# Visit onboarding without session
open http://localhost:3000/onboarding

# Should either:
# - Redirect to dashboard (if already completed)
# - Show onboarding (if not completed)
# - Show welcome screen
```

### Test 3: API Endpoints

```bash
# Test session endpoint (need real session_id)
curl http://localhost:3000/api/onboarding/session?session_id=cs_test_xxx

# Test status endpoint
curl http://localhost:3000/api/onboarding/status

# Test completion endpoint
curl -X POST http://localhost:3000/api/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{"domain": "test.com", "company": "Test Co"}'
```

---

## What's Pre-filled

When user arrives from Stripe checkout, the following data is automatically loaded:

```typescript
{
  subscription: {
    plan: "professional" | "enterprise",
    status: "trialing" | "active",
    trialEnd: 1730890800,  // Unix timestamp
  },
  dealership: {
    domain: "dealership.com",  // From Stripe metadata
    company: "Dealership Name",  // From Stripe metadata
  },
  customer: {
    email: "user@example.com"
  }
}
```

---

## Database Schema (Optional)

If you want to persist onboarding progress, run this migration:

```sql
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,

  -- Progress tracking
  current_step INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,

  -- Stripe/Clerk data
  stripe_session_id TEXT,
  domain TEXT,
  company_name TEXT,

  -- Integrations
  connected_integrations JSONB DEFAULT '[]',

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_onboarding UNIQUE(user_id, tenant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_user
  ON onboarding_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_incomplete
  ON onboarding_progress(completion_percentage)
  WHERE completion_percentage < 100;
```

**Note**: The system works WITHOUT this table - it gracefully handles missing database.

---

## Configuration

### Required Environment Variables

Already configured in `.env.local`:

```bash
# Clerk (for authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase (optional - for progress persistence)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Stripe Checkout Configuration

Your checkout already configured correctly:

```typescript
// app/api/stripe/create-checkout/route.ts
success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
```

✅ No changes needed!

---

## Features Included

### 1. Smart Pre-Onboarding
- Animated welcome screen
- Shows user name and plan
- Sets expectations
- Creates excitement

### 2. Session Integration
- Fetches Stripe data
- Shows trial countdown
- Pre-fills forms
- Personalized experience

### 3. Quick Setup
- Minimal friction
- Skip option
- Pre-filled data
- Fast completion

### 4. Progress Persistence (Optional)
- Saves progress at each step
- Resume capability
- Cross-device sync
- Never lose work

### 5. Error Handling
- Graceful fallbacks
- Missing data handling
- Database optional
- Clear error messages

---

## Next Enhancements

Want to add more features? Here's what's ready to integrate:

### Available Components (Already Built!)

1. **SmartProgressTracker** - Gamified progress bar
2. **PLGEnticement** - Conversion optimization
3. **SmartAIAgent** - AI-powered guidance
4. **SmartHelpSystem** - Contextual help
5. **SmartCompletion** - Success celebration

### How to Add Them

```typescript
// In app/onboarding/page.tsx

import SmartProgressTracker from '@/app/components/onboarding/SmartProgressTracker';
import PLGEnticement from '@/app/components/onboarding/PLGEnticement';

// Add progress tracker at top
<SmartProgressTracker
  currentStep={2}
  totalSteps={5}
  progress={40}
/>

// Add enticement after form
<PLGEnticement
  type="welcome"
  connectedCount={0}
  totalCount={5}
  ctaText="Continue"
  onCtaClick={handleNext}
/>
```

---

## Deployment Checklist

- [ ] Test complete flow locally
- [ ] Verify Stripe redirect works
- [ ] Test with real test card
- [ ] Check Clerk authentication
- [ ] Verify trial countdown shows
- [ ] Test skip functionality
- [ ] Confirm dashboard redirect
- [ ] Deploy to production
- [ ] Test on production with test mode
- [ ] Switch to live mode

---

## Support

### Common Issues

**Issue**: "Session data not loading"
**Fix**: Check Stripe webhook is configured and firing

**Issue**: "Redirect not working"
**Fix**: Verify `NEXT_PUBLIC_APP_URL` in environment variables

**Issue**: "Database errors"
**Fix**: System works without database - errors are logged but don't block flow

**Issue**: "User not authenticated"
**Fix**: Ensure Clerk webhook created user before onboarding

---

## Summary

✅ **What's Ready**:
- Complete onboarding page
- Stripe session integration
- Clerk authentication
- Trial countdown
- Quick setup form
- API endpoints
- Error handling
- Skip functionality

⏱️ **Implementation Time**: Complete!

🎯 **Next Step**: Test the flow end-to-end

🚀 **Ready to deploy!**

---

**Questions?** Check [ONBOARDING_STRIPE_INTEGRATION_GUIDE.md](ONBOARDING_STRIPE_INTEGRATION_GUIDE.md) for detailed integration guide.
