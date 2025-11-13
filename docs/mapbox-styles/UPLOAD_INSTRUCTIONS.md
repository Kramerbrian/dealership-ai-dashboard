# How to Upload the Daydream Style to Mapbox

You have 3 options to upload the style:

## Option 1: Manual Upload (Easiest) ✅

1. Go to [Mapbox Studio Styles](https://studio.mapbox.com/)
2. Click **"New style"** button
3. Click **"Upload"**
4. Select `docs/mapbox-styles/dealershipai-inception-daydream-style.json`
5. Wait for it to process (30-60 seconds)
6. Once uploaded, click on the style
7. Copy the **Style URL** from the top (looks like `mapbox://styles/briankramer/xxxxx`)
8. Update `lib/config/mapbox-styles.ts`:
   ```ts
   light: 'mapbox://styles/briankramer/YOUR_STYLE_ID',
   ```

## Option 2: Using Mapbox API with Secret Token

If you have a secret token with `styles:write` scope:

```bash
# 1. Get a secret token from https://account.mapbox.com/access-tokens/
#    Enable the 'styles:write' scope

# 2. Set the token
export MAPBOX_SECRET_TOKEN='sk.your_secret_token_here'

# 3. Run the upload script
chmod +x scripts/upload-mapbox-style.sh
./scripts/upload-mapbox-style.sh
```

The script will output the style URL to copy into your config.

## Option 3: Using Mapbox Studio API directly

```bash
curl -X POST "https://api.mapbox.com/styles/v1/briankramer?access_token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d @docs/mapbox-styles/dealershipai-inception-daydream-style.json
```

## After Upload

Once you have the style URL, update these files:

### 1. Update Style Config
File: `lib/config/mapbox-styles.ts`
```ts
export const MAPBOX_STYLES = {
  dark: 'mapbox://styles/briankramer/cmhwt6m5n006b01s1c6z9858y',
  light: 'mapbox://styles/briankramer/YOUR_NEW_STYLE_ID', // ← Update this
} as const;
```

### 2. Test the Style
```bash
npm run dev
```

Visit:
- Landing page (should use dark): http://localhost:3000
- Dashboard insights (should use light): http://localhost:3000/dash/insights

### 3. Enable Style Switching

The `DealerFlyInMap` component can be updated to accept a `theme` prop:

```tsx
<DealerFlyInMap
  lat={location.lat}
  lng={location.lng}
  theme="light" // or "dark"
/>
```

Or use automatic switching based on route with `shouldUseLightMode()` from the config.

## Troubleshooting

**Error: "Not Authorized - Invalid Token"**
- You're using a public token. Public tokens can't create styles.
- Get a secret token from https://account.mapbox.com/access-tokens/ with `styles:write` scope

**Style uploaded but not showing up**
- Wait 1-2 minutes for Mapbox to process
- Refresh Mapbox Studio
- Check that the JSON is valid (use https://jsonlint.com/)

**Style looks wrong in preview**
- The 3D perspective (pitch/bearing) may not show in Studio's 2D preview
- Test in your actual app where the camera is programmed
