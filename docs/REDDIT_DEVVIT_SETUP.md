# Reddit Devvit Setup

## Project ID

**Project ID:** `Ch5hdXhZdUdXMUdDNk9XTkRGR0JEd2JvT09jVG45ZGcSDGRlYWxlcnNoaXBhaRoFcmVhY3Q=`

**Project Name:** `dealershipai`

## Environment Variables

### Local Development (`.env.local`)

```bash
REDDIT_DEVVIT_PROJECT_ID=Ch5hdXhZdUdXMUdDNk9XTkRGR0JEd2JvT09jVG45ZGcSDGRlYWxlcnNoaXBhaRoFcmVhY3Q=
```

### Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API** → **Environment Variables**
3. Add:
   - **Key:** `REDDIT_DEVVIT_PROJECT_ID`
   - **Value:** `Ch5hdXhZdUdXMUdDNk9XTkRGR0JEd2JvT09jVG45ZGcSDGRlYWxlcnNoaXBhaRoFcmVhY3Q=`
   - **Scope:** All environments (Production, Preview, Development)

### Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Key:** `REDDIT_DEVVIT_PROJECT_ID`
   - **Value:** `Ch5hdXhZdUdXMUdDNk9XTkRGR0JEd2JvT09jVG45ZGcSDGRlYWxlcnNoaXBhaRoFcmVhY3Q=`
   - **Environments:** Production, Preview, Development
4. Click **Save**
5. Redeploy your project for changes to take effect

## Usage

Access the project ID in your code:

```typescript
// Server-side only (not exposed to client)
const devvitProjectId = process.env.REDDIT_DEVVIT_PROJECT_ID;

// Use in API routes or server components
if (!devvitProjectId) {
  throw new Error('REDDIT_DEVVIT_PROJECT_ID is not configured');
}
```

## Verification

After setting up, verify the variable is accessible:

```bash
# Check local .env.local
grep REDDIT_DEVVIT_PROJECT_ID .env.local

# Test in code
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.REDDIT_DEVVIT_PROJECT_ID)"
```

## Related Commands

```bash
# Create Devvit project (already done)
npm create devvit@latest

# Run dev server
npm run dev
```

## Notes

- This is a **server-side only** variable (no `NEXT_PUBLIC_` prefix)
- Keep it secret - don't commit to Git
- The project ID is used to identify your Devvit app on Reddit

