# Mapbox Style URL Configuration

**Date:** 2025-11-13  
**Status:** ✅ Configured in All Environments

---

## ✅ Style URL Added

**Style URL:** `mapbox://styles/briankramer/cmhxjbtcr004n01rzbis28jdy`

---

## Environment Configuration

### ✅ Local Development (.env.local)
**Status:** COMPLETE
```bash
NEXT_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/briankramer/cmhxjbtcr004n01rzbis28jdy
MAPBOX_STYLE_URL=mapbox://styles/briankramer/cmhxjbtcr004n01rzbis28jdy
```

### ✅ Vercel Production
**Status:** COMPLETE
- `NEXT_PUBLIC_MAPBOX_STYLE_URL` - Added
- `MAPBOX_STYLE_URL` - Added

### ✅ Vercel Preview
**Status:** COMPLETE
- `NEXT_PUBLIC_MAPBOX_STYLE_URL` - Added
- `MAPBOX_STYLE_URL` - Added

### ✅ Vercel Development
**Status:** COMPLETE
- `NEXT_PUBLIC_MAPBOX_STYLE_URL` - Added
- `MAPBOX_STYLE_URL` - Added

---

## Usage in Code

### Client-Side (React Components)
```typescript
const styleUrl = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL;
// Use in Mapbox GL JS
const map = new mapboxgl.Map({
  container: 'map',
  style: styleUrl, // or convert to https://api.mapbox.com/styles/v1/...
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
});
```

### Server-Side (API Routes)
```typescript
const styleUrl = process.env.MAPBOX_STYLE_URL;
// Use for server-side operations if needed
```

### Converting Style URL to API URL
```typescript
// Convert mapbox:// style URL to API URL
function getMapboxStyleApiUrl(styleUrl: string): string {
  // mapbox://styles/briankramer/cmhxjbtcr004n01rzbis28jdy
  // becomes: https://api.mapbox.com/styles/v1/briankramer/cmhxjbtcr004n01rzbis28jdy
  const match = styleUrl.match(/mapbox:\/\/styles\/([^/]+)\/([^/]+)/);
  if (match) {
    const [, username, styleId] = match;
    return `https://api.mapbox.com/styles/v1/${username}/${styleId}`;
  }
  return styleUrl; // Return as-is if not a mapbox:// URL
}
```

---

## Complete Mapbox Configuration

### Environment Variables Summary

**Client-Side (NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - API token (sk.eyJ...)
- `NEXT_PUBLIC_MAPBOX_STYLE_URL` - Style URL (mapbox://styles/...)

**Server-Side:**
- `MAPBOX_ACCESS_TOKEN` - API token (sk.eyJ...)
- `MAPBOX_STYLE_URL` - Style URL (mapbox://styles/...)

---

## Verification

### Check Local Configuration
```bash
cat .env.local | grep MAPBOX
```

### Check Vercel Configuration
```bash
vercel env ls | grep MAPBOX
```

### Test in Code
```typescript
// In a React component
console.log('Style URL:', process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL);
console.log('Access Token:', process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.substring(0, 10) + '...');
```

---

## Supabase Note

Supabase doesn't directly store environment variables. If you need the Mapbox style URL in Supabase Edge Functions:

1. **Option A:** Access via Vercel environment variables (already configured)
2. **Option B:** Add via Supabase Dashboard → Edge Functions → Environment Variables
3. **Option C:** Use the same values from Vercel (recommended)

---

## Next Steps

1. **Redeploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Use in Landing Page:**
   ```typescript
   // components/landing/DealerFlyInMap.tsx
   const styleUrl = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL;
   const apiUrl = getMapboxStyleApiUrl(styleUrl);
   
   const map = new mapboxgl.Map({
     container: 'map',
     style: apiUrl,
     accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
   });
   ```

3. **Verify in Production:**
   - Check that map loads with custom style
   - Verify style URL is accessible
   - Test on landing page

---

## Style URL Format

**Mapbox Style URL Format:**
```
mapbox://styles/{username}/{style_id}
```

**Example:**
```
mapbox://styles/briankramer/cmhxjbtcr004n01rzbis28jdy
```

**API URL Equivalent:**
```
https://api.mapbox.com/styles/v1/briankramer/cmhxjbtcr004n01rzbis28jdy
```

---

**Last Updated:** 2025-11-13  
**Status:** ✅ All environments configured

