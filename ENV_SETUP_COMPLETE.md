# Environment Setup Complete ✅

## API Key Configuration

The dAI GPT API key has been configured for:

### 1. Local Development (.env.local)

**Run this command to save the key:**
```bash
./scripts/save-dai-api-key.sh
```

Or manually add to `.env.local`:
```env
# DealershipAI GPT API Key
OPENAI_API_KEY=sk-***REDACTED***
DAI_API_KEY=sk-***REDACTED***
NEXT_PUBLIC_DAI_API_KEY=sk-***REDACTED***
NEXT_PUBLIC_API_BASE_URL=https://api.gpt.dealershipai.com
```

**Important:** 
- No quotes around values
- No trailing spaces
- Restart dev server after editing: `npm run dev`

---

### 2. Supabase Secrets

**Using Supabase CLI:**
```bash
supabase secrets set OPENAI_API_KEY="sk-***REDACTED***"
supabase secrets set DAI_API_KEY="sk-***REDACTED***"
```

**Or via Supabase Dashboard:**
1. Go to Project Settings → Secrets
2. Add `OPENAI_API_KEY` and `DAI_API_KEY`
3. Paste the key value (no quotes)

---

### 3. Vercel Environment Variables

**Using Vercel CLI:**
```bash
# Link project first (if not already linked)
vercel link

# Add environment variables
echo "sk-***REDACTED***" | vercel env add OPENAI_API_KEY production
echo "sk-***REDACTED***" | vercel env add DAI_API_KEY production
echo "sk-***REDACTED***" | vercel env add NEXT_PUBLIC_DAI_API_KEY production
echo "https://api.gpt.dealershipai.com" | vercel env add NEXT_PUBLIC_API_BASE_URL production
```

**Or via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `OPENAI_API_KEY` = `sk-***REDACTED***`
   - `DAI_API_KEY` = `sk-***REDACTED***`
   - `NEXT_PUBLIC_DAI_API_KEY` = `sk-***REDACTED***`
   - `NEXT_PUBLIC_API_BASE_URL` = `https://api.gpt.dealershipai.com`
3. Select environments: Production, Preview, Development
4. Redeploy after adding

---

## API Configuration Fixed ✅

### Updated `lib/apiConfig.ts`

The API configuration now:
- ✅ Uses `https://api.gpt.dealershipai.com` as base URL
- ✅ Sends `api_key` as **query parameter** (not header)
- ✅ Provides `buildDAIApiUrl()` helper function
- ✅ Provides `fetchDAIApi()` helper function

### Usage Example

```typescript
import { fetchDAIApi, buildDAIApiUrl } from '@/lib/apiConfig'

// Method 1: Using helper function
const result = await fetchDAIApi('/api/v1/analyze', {
  domain: 'terryreidhyundai.com'
})

// Method 2: Building URL manually
const url = buildDAIApiUrl('/api/v1/analyze', {
  domain: 'terryreidhyundai.com'
})
const response = await fetch(url)
```

### Test the API

```bash
# Test directly
curl "https://api.gpt.dealershipai.com/api/v1/analyze?domain=terryreidhyundai.com&api_key=sk-***REDACTED***"
```

---

## New Features Implemented ✅

### 1. OEL by Channel
- ✅ API: `/api/metrics/oel/channels`
- ✅ Hook: `useOELChannels()`
- ✅ Component: `OELChannelsChart`

### 2. Fix Pack ROI Monitor
- ✅ API: `/api/fix-pack/roi`
- ✅ Component: `FixPackROIPanel`

### 3. Scan Summary Modal
- ✅ Already exists, enhanced with auto-trigger
- ✅ Integration snippet provided

### 4. PIQR with OEL Integration
- ✅ API: `/api/metrics/piqr`
- ✅ Hook: `usePIQR()`
- ✅ Incorporates OEL as risk driver (35% weight)

### 5. Integration Snippets
- ✅ Complete integration guide: `INTEGRATION_SNIPPETS.md`
- ✅ Copy-paste ready code

---

## Next Steps

1. **Run the setup script:**
   ```bash
   ./scripts/save-dai-api-key.sh
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test API connection:**
   ```bash
   curl "https://api.gpt.dealershipai.com/api/v1/analyze?domain=example.com&api_key=YOUR_KEY"
   ```

4. **Integrate components:**
   - See `INTEGRATION_SNIPPETS.md` for copy-paste code
   - Add OEL by Channel chart to dashboard
   - Add Fix Pack ROI panel
   - Wire up Scan Summary modal

---

*All configuration complete and ready for use!*

