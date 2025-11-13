# Mapbox API Token Setup

## Token Added
```
sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ
```

## Environment Variables

### Local Development (.env.local)
✅ **Already added:**
```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ
MAPBOX_ACCESS_TOKEN=sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ
```

### Supabase Environment Variables

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ
MAPBOX_ACCESS_TOKEN=sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ
```

**Note:** Supabase doesn't directly store environment variables. You'll need to add these to Vercel instead, which Supabase can access via Edge Functions if needed.

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**, **Preview**, and **Development**:

**Variable 1:**
- **Name:** `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- **Value:** `sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ`
- **Environment:** Production, Preview, Development

**Variable 2:**
- **Name:** `MAPBOX_ACCESS_TOKEN`
- **Value:** `sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ`
- **Environment:** Production, Preview, Development

## Quick Setup via Vercel CLI

Alternatively, you can add via CLI:

```bash
# Add to Production
vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN production
# Paste: sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ

vercel env add MAPBOX_ACCESS_TOKEN production
# Paste: sk.eyJ1IjoiYnJpYW5rcmFtZXIiLCJhIjoiY21od3FrZG5iMDJiazJqcGl1d2hsMmRxMiJ9.3QZNNSGOELcxATdDzFTuMQ

# Add to Preview
vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN preview
vercel env add MAPBOX_ACCESS_TOKEN preview

# Add to Development
vercel env add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN development
vercel env add MAPBOX_ACCESS_TOKEN development
```

## Usage in Code

### Client-side (React components)
```typescript
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
```

### Server-side (API routes)
```typescript
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
```

## Verification

After adding to Vercel, redeploy:
```bash
vercel --prod
```

Then verify the token is accessible:
```bash
curl https://your-app.vercel.app/api/health
# Should show Mapbox token is configured
```

