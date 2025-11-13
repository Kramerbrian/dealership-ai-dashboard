# Mapbox Custom Styles for DealershipAI

This directory contains custom Mapbox style JSON files for the DealershipAI application.

## Styles

### 1. DealershipAI Inception Dark (Night Mode)
**Style URL:** `mapbox://styles/briankramer/cmhwt6m5n006b01s1c6z9858y`

Cinematic dark theme with:
- Deep black backgrounds (#0a0a0a)
- Midnight blue water
- Subtle teal accents
- Warm amber motorways
- Dramatic 3D perspective (pitch: 45°, bearing: 340°)

**Use cases:**
- Landing page fly-in animation
- Hero sections
- Pulse dashboard overview
- Nighttime/dramatic views

### 2. DealershipAI Inception Daydream (Light Mode)
**File:** `dealershipai-inception-daydream-style.json`

Light cinematic theme with:
- Soft off-white background (#f3f4f6)
- Very light gray land (#f9fafb)
- Pale teal water (#e0f2fe → #bae6fd)
- Blue primary roads (#3b82f6)
- Warm gold motorways (#f59e0b)
- Quiet labels (gray tones)

**Use cases:**
- Dashboard insights pages
- Inspection/detail views
- Daytime mode
- Competitor analysis maps

## How to Upload to Mapbox Studio

1. Go to **[Mapbox Studio](https://studio.mapbox.com/)** → **Styles**
2. Click **New style** → **Upload JSON**
3. Select `dealershipai-inception-daydream-style.json`
4. Let it process (may take 30-60 seconds)
5. Click the style and copy the **Style URL**:
   ```
   mapbox://styles/yourusername/xxxxxxxxxx
   ```
6. Update your environment variables or code with the new style URL

## Using in Code

```tsx
const MAPBOX_STYLES = {
  dark: 'mapbox://styles/briankramer/cmhwt6m5n006b01s1c6z9858y',
  light: 'mapbox://styles/briankramer/YOUR_DAYDREAM_STYLE_ID',
};

// In your component
const map = new mapboxgl.Map({
  container: mapNode.current,
  style: isDarkMode ? MAPBOX_STYLES.dark : MAPBOX_STYLES.light,
  center: [lng, lat],
  zoom: 13,
  pitch: 45,
  bearing: 340,
});
```

## Style Toggle Examples

### 1. Based on Route
```tsx
const isDashboardInsights = pathname.includes('/dash/insights');
const mapStyle = isDashboardInsights ? MAPBOX_STYLES.light : MAPBOX_STYLES.dark;
```

### 2. Based on User Preference
```tsx
const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
const mapStyle = MAPBOX_STYLES[mapTheme];
```

### 3. Based on Time of Day (Cinematic!)
```tsx
const hour = new Date().getHours();
const isDaytime = hour >= 6 && hour < 18;
const mapStyle = isDaytime ? MAPBOX_STYLES.light : MAPBOX_STYLES.dark;
```

## Design Philosophy

Both styles follow the "Inception" theme - cinematic, dreamlike, with layered depth:

- **Dark Mode:** Feels like exploring a city at night from above, mysterious and focused
- **Light Mode:** Feels like a pristine architectural model, clean and analytical

The styles maintain consistent:
- 3D perspective and camera angles
- Road hierarchy and color coding
- Label sizing and legibility
- Smooth transitions between zoom levels

## Technical Notes

- Both styles use Mapbox vector tiles (`mapbox.mapbox-streets-v8`)
- Optimized for zoom levels 3-15
- Smooth interpolation on road widths and colors
- Light mode reduces text opacity slightly (0.9) for softer look
- Dark mode uses higher opacity (1.0) for clarity against dark bg

## Next Steps

After uploading the Daydream style:
1. Update `.env.local` with the light style URL
2. Update `components/landing/DealerFlyInMap.tsx` to support both styles
3. Add theme toggle UI component
4. Test transitions between modes
