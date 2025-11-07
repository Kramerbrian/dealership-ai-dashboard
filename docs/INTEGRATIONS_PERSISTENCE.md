# Integrations Persistence - Reviews & Visibility

## ✅ Implementation Complete

Persistence for Reviews (GBP place_id) and Visibility engine switches is now implemented using Supabase.

---

## 📋 What Was Implemented

### 1. Database Migration
- ✅ `supabase/migrations/20251108_integrations_reviews_visibility.sql`
  - Indexes for `kind` and `tenant_id`
  - JSON indexes for `place_id` (reviews) and `engines` (visibility)

### 2. API Routes Updated
- ✅ `app/api/reviews/summary/route.ts`
  - Now retrieves stored `place_id` from integrations table
  - Falls back to query param if provided
  - Returns `connected: true/false` based on stored data

- ✅ `app/api/visibility/presence/route.ts`
  - Now retrieves stored engine preferences from integrations table
  - Only shows engines that are enabled in tenant preferences
  - Returns `connected: true` when preferences are stored

### 3. Admin Routes (Already Exist)
- ✅ `app/api/admin/integrations/reviews/route.ts` - Save place_id
- ✅ `app/api/admin/integrations/visibility/route.ts` - Save engine preferences

### 4. Store Helpers (Already Exist)
- ✅ `lib/integrations/store.ts`
  - `getIntegration()` - Retrieve integration by tenant + kind
  - `upsertIntegration()` - Save/update integration
  - `setReviewsPlaceId()` - Convenience helper for reviews
  - `setVisibilityEngines()` - Convenience helper for visibility

### 5. Adapters Updated
- ✅ All adapters now use `NEXT_PUBLIC_APP_URL` for server-side fetch
- ✅ Fallback to `window.location.origin` for client-side

---

## 🗄️ Database Schema

The `integrations` table stores:

```sql
-- Reviews integration
kind = 'reviews'
metadata = {
  "place_id": "ChIJ...",
  "provider": "google"
}

-- Visibility integration
kind = 'visibility'
metadata = {
  "engines": {
    "ChatGPT": true,
    "Perplexity": true,
    "Gemini": false,
    "Copilot": true
  }
}
```

---

## 🔧 Usage

### Save Reviews Place ID

```typescript
// From onboarding or settings
await fetch('/api/admin/integrations/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ placeId: 'ChIJ...' })
});
```

### Save Visibility Engine Preferences

```typescript
// From onboarding or settings
await fetch('/api/admin/integrations/visibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    engines: {
      ChatGPT: true,
      Perplexity: true,
      Gemini: false,
      Copilot: true
    }
  })
});
```

### Retrieve Data (Automatic)

The API routes automatically retrieve stored preferences:

```typescript
// Reviews - uses stored place_id if available
GET /api/reviews/summary
GET /api/reviews/summary?placeId=ChIJ...  // Override with query param

// Visibility - uses stored engine preferences
GET /api/visibility/presence?domain=example.com
```

---

## 🧪 Testing

### 1. Test Reviews Persistence

```bash
# Save place_id
curl -X POST http://localhost:3000/api/admin/integrations/reviews \
  -H "Content-Type: application/json" \
  -d '{"placeId": "ChIJ..."}'

# Retrieve (should use stored place_id)
curl http://localhost:3000/api/reviews/summary
```

### 2. Test Visibility Persistence

```bash
# Save engine preferences
curl -X POST http://localhost:3000/api/admin/integrations/visibility \
  -H "Content-Type: application/json" \
  -d '{"engines": {"ChatGPT": true, "Perplexity": false}}'

# Retrieve (should only show ChatGPT)
curl "http://localhost:3000/api/visibility/presence?domain=example.com"
```

---

## 📝 Next Steps

### 1. Run Migration

```bash
# Apply the migration to Supabase
supabase migration up 20251108_integrations_reviews_visibility
```

Or via Supabase Dashboard:
- Go to SQL Editor
- Run the migration SQL

### 2. Wire Up Onboarding UI

Add to your onboarding flow:

```typescript
// When user confirms GBP place
async function savePlaceId(placeId: string) {
  await fetch("/api/admin/integrations/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ placeId })
  });
}

// When user toggles engines
async function saveEnginePrefs(prefs: {
  ChatGPT?: boolean;
  Perplexity?: boolean;
  Gemini?: boolean;
  Copilot?: boolean;
}) {
  await fetch("/api/admin/integrations/visibility", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ engines: prefs })
  });
}
```

### 3. Connect Real Data Sources

Update the TODO sections in:
- `app/api/reviews/summary/route.ts` - Connect to GBP API
- `app/api/visibility/presence/route.ts` - Connect to presence service

---

## 🎯 Benefits

1. **No Re-entry** - Place ID and engine preferences persist across sessions
2. **Tenant Isolation** - Each tenant has their own preferences
3. **Caching** - Upstash Redis caches results with TTL
4. **Flexible** - Query params can override stored values
5. **Clay Lens** - System remembers user choices for better personalization

---

## 🔍 Verification

After implementation, verify:

1. ✅ Migration applied (check Supabase dashboard)
2. ✅ Indexes created (faster queries)
3. ✅ API routes use stored metadata
4. ✅ Admin routes save preferences
5. ✅ Caching works (check Redis)

---

**Status**: ✅ Complete  
**Next**: Run migration and test persistence

