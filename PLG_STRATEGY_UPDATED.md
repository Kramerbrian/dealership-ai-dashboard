# Updated PLG Strategy - Anonymous Scans + Freemium

**Date**: November 3, 2025
**Strategy**: Try Before You Sign → Sign Up for Your Own → Upgrade for More

---

## The Three User Journeys

### Journey 1: Anonymous User (No Signup)
**Goal**: Let anyone try the product with ZERO friction

```
Landing Page
    ↓
Enter ANY dealership URL (no signup required)
    ↓
Run AI Visibility Scan
    ↓
See Full Results
    ↓
Limit: 5 scans per month (tracked by IP address)
    ↓
After 5 scans → "Sign up to scan your own dealership unlimited times"
```

**Key Features**:
- ✅ No email required
- ✅ No signup required
- ✅ Instant results
- ✅ 5 scans/month per IP
- ✅ Can scan ANY dealership (competitors, etc.)
- ❌ Cannot save results
- ❌ Cannot track progress
- ❌ No automated features

**Conversion Trigger**: After 5 scans used

### Journey 2: Authenticated Free User (Tier 1)
**Goal**: Own your dealership's data and track progress

```
Landing Page
    ↓
Click "Sign Up Free" or hit 5-scan limit
    ↓
Clerk Sign-Up (email + password or OAuth)
    ↓
Onboarding: Add YOUR dealership
    ↓
Unlimited scans of YOUR dealership (free forever!)
    ↓
Saved scans, progress tracking, alerts
    ↓
Still limited: 5 scans/month of OTHER dealerships
```

**Key Features**:
- ✅ Unlimited scans of YOUR dealership
- ✅ Save scan history
- ✅ Track progress over time
- ✅ Email alerts
- ✅ Basic AI visibility score
- ✅ Competitor leaderboard (view only)
- ❌ No automated checks
- ❌ No auto-responses
- ❌ Limited competitor analysis

**Conversion Trigger**:
- Want bi-weekly automated checks
- Need automated responses
- Want deeper competitor intel

### Journey 3: Paid User (Tier 2 & 3)
**Goal**: Fully automated AI visibility management

**Tier 2 - Professional ($499/mo)**:
- Bi-weekly automated checks
- Auto-response generation
- Schema markup generator
- Priority support
- Full competitor analysis
- 30-day action plans

**Tier 3 - Enterprise ($999/mo)**:
- Everything in Tier 2
- Multi-location support
- White-label reports
- Dedicated account manager
- API access
- SSO

---

## Implementation Plan

### Phase 1: Anonymous Scan Tracking

**Create API endpoint**: `/api/scans/track`

```typescript
// Track anonymous scans by IP
POST /api/scans/track
{
  ip: "192.168.1.1",
  domain: "dealership.com",
  timestamp: "2025-11-03T19:00:00Z"
}

// Check remaining scans
GET /api/scans/remaining?ip=192.168.1.1
Response: { remaining: 3, total: 5, resetDate: "2025-12-01" }
```

**Database Schema**:
```sql
CREATE TABLE anonymous_scans (
  id UUID PRIMARY KEY,
  ip_address INET NOT NULL,
  domain TEXT NOT NULL,
  scan_results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_ip_date (ip_address, created_at)
);

-- Count scans per IP per month
CREATE FUNCTION count_monthly_scans(ip INET)
RETURNS INTEGER AS $$
  SELECT COUNT(*)
  FROM anonymous_scans
  WHERE ip_address = ip
    AND created_at >= date_trunc('month', NOW());
$$ LANGUAGE SQL;
```

### Phase 2: Landing Page Updates

**File**: `components/landing/SimplifiedLandingPage.tsx`

```typescript
const [scansRemaining, setScansRemaining] = useState<number>(5);
const [showSignupPrompt, setShowSignupPrompt] = useState(false);

// Check remaining scans on load
useEffect(() => {
  checkRemainingScans();
}, []);

const checkRemainingScans = async () => {
  const res = await fetch('/api/scans/remaining');
  const { remaining } = await res.json();
  setScansRemaining(remaining);

  if (remaining === 0) {
    setShowSignupPrompt(true);
  }
};

const handleAnalyze = async () => {
  if (scansRemaining === 0) {
    setShowSignupPrompt(true);
    return;
  }

  // Run scan
  await runScan(urlInput);

  // Track usage
  await fetch('/api/scans/track', {
    method: 'POST',
    body: JSON.stringify({ domain: urlInput })
  });

  // Update remaining
  setScansRemaining(prev => prev - 1);

  if (scansRemaining === 1) {
    // Show "last scan" warning
  }
};
```

**Signup Prompts**:

```typescript
// After 3rd scan
{scansRemaining === 2 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm text-blue-900">
      ⚡ You have <strong>2 scans left</strong> this month.
      <br />
      <button className="text-blue-600 underline">
        Sign up free
      </button> to get unlimited scans of your own dealership!
    </p>
  </div>
)}

// After 5th scan (hit limit)
{scansRemaining === 0 && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 max-w-md">
      <h3 className="text-2xl font-bold mb-4">You've used all 5 scans!</h3>
      <p className="text-gray-600 mb-6">
        Sign up free to get:
        <ul className="list-disc pl-6 mt-2">
          <li>Unlimited scans of YOUR dealership</li>
          <li>Save and track your progress</li>
          <li>Email alerts for changes</li>
          <li>Competitive leaderboard</li>
        </ul>
      </p>
      <button
        onClick={() => router.push('/signup?tier=free')}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
      >
        Sign Up Free - No Credit Card
      </button>
      <p className="text-xs text-gray-500 text-center mt-4">
        Resets on Dec 1st
      </p>
    </div>
  </div>
)}
```

### Phase 3: Authenticated Free Tier

**Update Onboarding**: `/app/onboarding/page.tsx`

```typescript
// For authenticated free users
{tier === 'free' && user && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
    <h3 className="text-xl font-semibold text-green-900 mb-2">
      🎉 Welcome to DealershipAI!
    </h3>
    <p className="text-green-800 mb-4">
      You're on the <strong>Free tier</strong>. Here's what you get:
    </p>
    <ul className="space-y-2 text-sm text-green-900">
      <li className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        <strong>Unlimited scans</strong> of YOUR dealership
      </li>
      <li className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        Save scan history and track progress
      </li>
      <li className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        Email alerts for AI visibility changes
      </li>
      <li className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        View competitive leaderboard
      </li>
    </ul>
    <p className="text-xs text-green-700 mt-4">
      Upgrade to Pro for bi-weekly automated checks and auto-responses!
    </p>
  </div>
)}
```

### Phase 4: Dashboard Upgrades

**Show tier limits clearly**:

```typescript
// In dashboard header
<div className="flex items-center gap-4">
  <span className="text-sm text-gray-600">
    Free Tier
  </span>
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500">
      {userScans.thisMonth} scans this month
    </span>
    <span className="text-xs text-blue-600">
      (Unlimited for your dealership!)
    </span>
  </div>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
    Upgrade to Pro
  </button>
</div>
```

---

## The Complete Flows

### Flow A: Anonymous User → Try Product

```
1. Land on site (no signup)
2. Enter any dealership URL
3. Click "Analyze" (no friction!)
4. See full AI visibility report
5. Badge shows: "4/5 scans remaining"
6. Can scan 4 more dealerships
7. After 5th scan → Signup prompt modal
```

### Flow B: Anonymous → Authenticated Free

```
1. Hit 5-scan limit OR click "Sign Up Free"
2. Clerk signup modal (email or OAuth)
3. Onboarding: "Add YOUR dealership"
4. Enter your dealership domain
5. Complete onboarding
6. Dashboard with unlimited own-dealership scans
7. See upgrade prompts for Pro features
```

### Flow C: Authenticated Free → Paid

```
1. Using Free tier, see locked features
2. Click "Upgrade to Pro"
3. Signup page with plan selection
4. Stripe checkout (14-day trial)
5. Onboarding with enhanced features
6. Dashboard with full automation
```

---

## Conversion Funnels

### Funnel 1: Anonymous → Sign Up (Target: 30%)

**Triggers**:
1. After 3rd scan: "2 scans left - sign up for unlimited!"
2. After 5th scan: Modal blocking further scans
3. On competitor scan: "Sign up to scan YOUR dealership unlimited"
4. On results page: "Save this scan? Sign up free!"

### Funnel 2: Free → Pro (Target: 25%)

**Triggers**:
1. Day 7: "Want bi-weekly automated checks?"
2. After 10 manual scans: "Tired of manual scanning? Automate it!"
3. When viewing competitors: "Unlock full competitor analysis"
4. In schema section: "Generate schema automatically"

---

## Key Metrics

### Anonymous Users
- **Scan Completion Rate**: % who complete first scan
  - Target: >85%
- **Multi-Scan Rate**: % who use >1 scan
  - Target: >60%
- **Signup Conversion**: % who hit limit and signup
  - Target: >30%

### Authenticated Free Users
- **Onboarding Completion**: % who add their dealership
  - Target: >90%
- **Active Usage**: % who scan at least weekly
  - Target: >50%
- **Upgrade Rate**: % who convert to Pro within 30 days
  - Target: >25%

### Paid Users
- **Trial → Paid**: % who don't cancel after trial
  - Target: >40%
- **Revenue per User**: Average monthly value
  - Target: $600+

---

## Summary

### The New Strategy

**Before** (old):
- Free tier required signup immediately
- Friction at first interaction
- Lower trial rate

**After** (new):
- No signup for first 5 scans (try before you buy!)
- Zero friction → higher engagement
- Natural conversion at limit
- Free tier = unlimited own dealership
- Clear upgrade path

### Benefits

✅ **Lower Barrier**: Anyone can try instantly
✅ **Higher Engagement**: More people complete first scan
✅ **Better Conversion**: Users see value before signing up
✅ **Clearer Tiers**: Anonymous → Free → Pro progression
✅ **Sticky Free Tier**: Users own their dealership data

---

## Next Steps

1. **Implement IP-based scan tracking**
2. **Add remaining scans counter** to landing page
3. **Create signup prompt modals**
4. **Update onboarding** for authenticated free users
5. **Add upgrade prompts** in dashboard
6. **Test complete flows**

---

**Files to Create/Update**:
- `/api/scans/track/route.ts` - Track anonymous scans
- `/api/scans/remaining/route.ts` - Check remaining scans
- `components/landing/SimplifiedLandingPage.tsx` - Add scan counter
- `components/landing/SignupPromptModal.tsx` - Limit reached modal
- `app/onboarding/page.tsx` - Differentiate anonymous vs authenticated
- Database migration for `anonymous_scans` table

Ready to implement? 🚀
