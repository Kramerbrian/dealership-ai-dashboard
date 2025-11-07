# API Testing Guide

## Authentication Required Endpoints

Most API endpoints require Clerk authentication for **tenant isolation** and **security**. This ensures:
- Each tenant only sees their own data
- Integration preferences are isolated per tenant
- Tokens and sensitive data are protected

---

## Protected Endpoints

These endpoints use `withAuth` wrapper and require Clerk session:

- `/api/visibility/presence` - Engine presence metrics
- `/api/reviews/summary` - Reviews summary
- `/api/ga4/summary` - GA4 analytics
- `/api/pulse/snapshot` - Pulse feed
- `/api/competitors` - Competitor analysis
- `/api/admin/integrations/*` - Integration management

---

## Testing Methods

### Method 1: Browser Testing (Recommended)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Sign in with Clerk:**
   - Click "Sign In" or navigate to `/sign-in`
   - Complete authentication flow
   - Session cookie is automatically set

4. **Test in browser console:**
   ```javascript
   // Test visibility endpoint
   fetch('/api/visibility/presence?domain=example.com')
     .then(r => r.json())
     .then(console.log);
   ```

### Method 2: curl with Session Cookie

1. **Get session cookie from browser:**
   - Open DevTools (F12)
   - Go to Application/Storage → Cookies
   - Copy `__clerk_db_jwt` or `__session` value

2. **Test with curl:**
   ```bash
   curl -H "Cookie: __clerk_db_jwt=YOUR_COOKIE_VALUE" \
        "http://localhost:3000/api/visibility/presence?domain=example.com"
   ```

### Method 3: Postman/Insomnia

1. **Set up authentication:**
   - Type: Cookie
   - Name: `__clerk_db_jwt`
   - Value: (from browser DevTools)

2. **Make request:**
   ```
   GET http://localhost:3000/api/visibility/presence?domain=example.com
   ```

---

## Development Test Endpoint

For quick testing without authentication, use the test endpoint:

```bash
# Public test endpoint (development only)
curl "http://localhost:3000/api/test/visibility?domain=example.com"
```

**Note:** This endpoint returns synthetic data and doesn't use tenant preferences.

---

## Expected Responses

### Success (200 OK)
```json
{
  "domain": "example.com",
  "engines": [
    { "name": "ChatGPT", "presencePct": 89 },
    { "name": "Perplexity", "presencePct": 78 },
    { "name": "Gemini", "presencePct": 72 },
    { "name": "Copilot", "presencePct": 64 }
  ],
  "lastCheckedISO": "2025-11-07T06:00:00.000Z",
  "connected": true
}
```

### Unauthorized (401)
```json
{
  "error": "Unauthorized: tenant not found"
}
```

### Server Error (500)
```json
{
  "error": "error"
}
```

---

## Troubleshooting

### "Unauthorized: tenant not found"
- **Cause:** No Clerk session or invalid session
- **Fix:** Sign in via browser or check session cookie

### "Cannot find module" errors
- **Cause:** Build cache issues
- **Fix:** 
  ```bash
  rm -rf .next
  npm run dev
  ```

### Missing environment variables
- **Cause:** Required env vars not set
- **Fix:** Check `.env.local` for:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

---

## Production Testing

In production, all endpoints require authentication. Use:
- Browser with authenticated session
- API client with proper auth headers
- Server-side calls with service tokens

---

## Security Notes

- **Never expose** `CLERK_SECRET_KEY` or `SUPABASE_SERVICE_ROLE` to client
- **Always use** `withAuth` wrapper for tenant-scoped endpoints
- **Cache** responses appropriately to reduce auth overhead
- **Rate limit** public endpoints to prevent abuse

