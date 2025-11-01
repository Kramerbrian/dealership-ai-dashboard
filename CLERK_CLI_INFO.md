# Clerk CLI - Current Capabilities

## ❌ Limitation
The Clerk CLI installed (`@nikosdouvlis/clerk-cli`) doesn't support configuring **Allowed Origins** or **CORS settings** from the command line.

## ✅ What You Can Do

### Option 1: Use Clerk Dashboard (Recommended)
1. Go to https://dashboard.clerk.com
2. Find **Settings** → **Allowed Origins**
3. Add `https://*.vercel.app`
4. Save

See detailed instructions: `ADD_VERCEL_TO_CLERK_INSTRUCTIONS.md`

### Option 2: Use Clerk Management API

If you have API access, you can use the Clerk Management API:

```bash
# Get your instance ID from .env or Vercel
CLERK_SECRET_KEY="sk_..."

# Update allowed origins via API
curl -X PATCH "https://api.clerk.dev/v1/instances" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "allowed_origins": [
      "https://dealershipai.com",
      "https://dealershipai-app.com",
      "https://*.vercel.app"
    ]
  }'
```

**Note**: Check Clerk's API documentation for exact endpoint format.

### Option 3: Accept the Limitation

The "Invalid host" error only affects:
- Authenticated routes (`/dashboard`, `/intelligence`)
- When accessed via `.vercel.app` URLs

**Your public landing page at `/` works fine** and doesn't use Clerk authentication!

## 🎯 Recommended Solution

For production, use the **Clerk Dashboard** to add allowed origins:
- Fastest method
- Visual interface
- Changes take effect immediately

**Follow**: `ADD_VERCEL_TO_CLERK_INSTRUCTIONS.md` for step-by-step guide.
