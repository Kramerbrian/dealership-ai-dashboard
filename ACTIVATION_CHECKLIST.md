# ✅ OpenAI GPT Integration - Activation Checklist

## Current Status
- ✅ **Development server running** on http://localhost:3001
- ✅ **OpenAI API key configured** in .env.local
- ✅ **All code implemented** and ready
- ⚠️ **Need database migration**
- ⚠️ **Need OpenAI Assistant setup**

## 🎯 Complete These 3 Steps (15 minutes total)

### Step 1: Database Migration (5 minutes)
**Action Required:** Run the SQL migration in your Supabase dashboard

1. **Open your Supabase project dashboard**
2. **Go to SQL Editor**
3. **Copy the entire content** from: `supabase/migrations/20241220000000_add_aiv_tables.sql`
4. **Paste and execute** the SQL
5. **Verify success** - you should see 4 new tables created

**Tables that will be created:**
- `aiv_weekly` - Stores AIV metrics
- `dealers` - Dealer information  
- `dealer_access` - User permissions
- `audit_log` - Action tracking

### Step 2: Configure Supabase Credentials (3 minutes)
**Action Required:** Update .env.local with your actual Supabase values

```bash
# Edit .env.local and replace these placeholder values:
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-service-key
```

**Where to find these:**
- Go to your Supabase project → Settings → API
- Copy the Project URL and API keys

### Step 3: Create OpenAI Assistant (7 minutes)
**Action Required:** Create an Assistant in OpenAI Platform

1. **Go to:** https://platform.openai.com/assistants
2. **Click:** "Create Assistant"
3. **Configure:**
   - **Name:** `DealershipAI AIV Calculator`
   - **Model:** `gpt-4-turbo-preview`
   - **Instructions:** (Copy from below)
4. **Save** and copy the Assistant ID
5. **Update .env.local:**
   ```bash
   OPENAI_ASSISTANT_ID=asst_your-actual-assistant-id-here
   ```

**Assistant Instructions:**
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

## 🧪 Test Integration

After completing all 3 steps above:

```bash
# Run the test script
./test-openai-integration.sh

# Expected results:
# ✅ GPT Proxy working
# ✅ AIV Metrics endpoint working  
# ✅ Dashboard includes AIV Metrics Panel
```

## 🎉 Verify Success

1. **Visit:** http://localhost:3001/dashboard
2. **Look for:** "AI Visibility Index" panel
3. **Click:** "Compute Initial AIV" button
4. **Verify:** Real-time scores and recommendations appear

## 🚨 Troubleshooting

### If tests fail:

**GPT Proxy Error:**
- Check OpenAI API key is valid
- Verify Assistant ID is correct
- Ensure OpenAI account has credits

**AIV Metrics Error:**
- Verify Supabase credentials are correct
- Check database migration completed successfully
- Ensure tables exist in Supabase

**Dashboard Missing Panel:**
- Restart server: `npm run dev`
- Check browser console for errors
- Verify all environment variables are set

## 📞 Quick Commands

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

## 🎯 Success Indicators

You'll know it's working when:
- ✅ AIV Metrics Panel appears on dashboard
- ✅ "Compute Initial AIV" button works
- ✅ Real-time scores display (AIV, ATI, CRS)
- ✅ Elasticity shows USD per point
- ✅ AI recommendations appear
- ✅ No errors in browser console

---

**Ready to activate?** Complete the 3 steps above, then run the test script!
