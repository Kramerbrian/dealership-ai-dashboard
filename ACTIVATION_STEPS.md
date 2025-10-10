# 🚀 OpenAI GPT Integration - Activation Steps

## Current Status
- ✅ **Development server running** on http://localhost:3001
- ✅ **OpenAI API key configured**
- ⚠️ **Need Supabase credentials**
- ⚠️ **Need OpenAI Assistant setup**

## Step 1: Database Migration (5 minutes)

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content from `supabase/migrations/20241220000000_add_aiv_tables.sql`
4. Paste and run the SQL
5. Verify tables are created: `aiv_weekly`, `dealers`, `dealer_access`, `audit_log`

### Option B: Using Supabase CLI (if installed)
```bash
supabase db push
```

## Step 2: Configure Supabase Credentials

Update your `.env.local` with actual Supabase values:

```bash
# Replace these placeholder values:
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-service-key
```

## Step 3: Create OpenAI Assistant (5 minutes)

1. Go to [OpenAI Platform](https://platform.openai.com/assistants)
2. Click **"Create Assistant"**
3. Configure with these settings:

**Name:** `DealershipAI AIV Calculator`

**Model:** `gpt-4-turbo-preview`

**Instructions:**
```
You are DealershipAI, an expert in automotive AI visibility analysis. 

When computing AIV metrics, always respond with valid JSON containing:
- aiv: Overall AI Visibility Score (0-100)
- ati: Answer Engine Intelligence Score (0-100) 
- crs: Citation Relevance Score (0-100)
- elasticity_usd_per_pt: Revenue impact per AIV point
- r2: Statistical confidence coefficient (0-1)
- recommendations: Array of 3 actionable insights

Example response:
{
  "aiv": 82,
  "ati": 78,
  "crs": 85,
  "elasticity_usd_per_pt": 156.30,
  "r2": 0.87,
  "recommendations": [
    "Improve local SEO citations",
    "Optimize for voice search queries", 
    "Enhance review response rate"
  ]
}
```

4. **Save** the assistant
5. **Copy the Assistant ID** (starts with `asst_`)
6. Update `.env.local`:
```bash
OPENAI_ASSISTANT_ID=asst_your-actual-assistant-id-here
```

## Step 4: Test Integration

After completing steps 1-3, run the test script:

```bash
./test-openai-integration.sh
```

Expected results:
- ✅ GPT Proxy working
- ✅ AIV Metrics endpoint working  
- ✅ Dashboard includes AIV Metrics Panel

## Step 5: Verify Dashboard

1. Visit: http://localhost:3001/dashboard
2. Look for the **"AI Visibility Index"** panel
3. Click **"Compute Initial AIV"** to generate sample data
4. Verify the panel shows:
   - AIV Score (0-100)
   - ATI, CRS, R² scores
   - Elasticity in USD per point
   - AI recommendations

## Troubleshooting

### If GPT Proxy fails:
- Check OpenAI API key is valid
- Verify Assistant ID is correct
- Check OpenAI account has credits

### If AIV Metrics fails:
- Verify Supabase credentials
- Check database migration ran successfully
- Ensure tables exist in Supabase

### If Dashboard missing panel:
- Restart development server: `npm run dev`
- Check browser console for errors
- Verify component imports are correct

## Quick Commands

```bash
# Restart server after env changes
npm run dev

# Test integration
./test-openai-integration.sh

# Check environment
grep -E "(OPENAI|SUPABASE)" .env.local

# View dashboard
open http://localhost:3001/dashboard
```

## Success Indicators

You'll know it's working when:
- ✅ AIV Metrics Panel appears on dashboard
- ✅ "Compute Initial AIV" button works
- ✅ Real-time scores display
- ✅ AI recommendations show
- ✅ No errors in browser console

---

**Ready to proceed?** Complete steps 1-3 above, then run the test script!
