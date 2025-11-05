# 🚀 DealershipAI Feature Activation Guide

## Quick Access Buttons

All features are now accessible directly from the dashboard header:

### 1. **🧠 Cognitive Dashboard**
- **Location**: Header button (top right)
- **Click**: "🧠 Cognitive Dashboard" button
- **What it does**: Opens the dAI Cognitive Dashboard modal with role-specific KPIs

### 2. **👁️ AIV™ Score**
- **Location**: Header button (top right)
- **Click**: "👁️ AIV™ Score" button
- **What it does**: Opens the AIV (Algorithmic Visibility Index) modal with detailed breakdown

### 3. **📊 ADI™ Score** (NEW)
- **Location**: Header button (top right)
- **Click**: "📊 ADI™ Score" button
- **What it does**: Opens the ADI (Agent Discoverability Index) modal with radar charts and component breakdown

### 4. **🚀 Onboarding** (NEW)
- **Location**: Header button (top right)
- **Click**: "🚀 Onboarding" button
- **What it does**: Opens the onboarding modal for new users or re-running setup

### 5. **HAL-9000 Chatbot**
- **Location**: Floating button (bottom right)
- **Click**: Chat icon to open/close
- **What it does**: AI assistant for answering questions about your dealership metrics

## Settings Tab Access

Navigate to **Settings** tab (⚙️ icon) to access:

- **Run Onboarding**: Opens the onboarding flow
- **View ADI Score**: Opens the ADI modal
- **Profile**: Edit dealer profile
- **Connections**: Manage integrations

## DashboardHovercards (Live Metrics)

The **DashboardHovercards** component is already active in the `TabbedDashboard` view:

- **Location**: Overview tab (in TabbedDashboard)
- **Features**: 
  - Live KPI scores (AIV, ATI, CVI, ORI, GRI, DPI)
  - Auto-refreshes every 24 hours
  - Trend indicators (↑/↓)
  - Hover tooltips with detailed explanations
  - Color-coded glow effects based on scores

## GEO Test Dashboard

The **GEOTestCard** component is available for testing local search visibility:

- **Location**: Can be added to any tab
- **API Routes**: 
  - `POST /api/geo/test` - Run GEO tests
  - `GET /api/geo/results?city=Naples` - Get results
- **Features**:
  - Generate weekly prompts
  - Test local search visibility
  - Generate fix recommendations

## API Endpoints

### Active Endpoints

1. **`/api/ai-scores`** - Returns live KPI scores
   ```bash
   GET /api/ai-scores?domain=germainnissan.com
   ```

2. **`/api/geo/test`** - Run GEO tests
   ```bash
   POST /api/geo/test
   Content-Type: application/json
   {
     "city": "Naples",
     "prompts": [] // Optional, will generate if not provided
   }
   ```

3. **`/api/geo/results`** - Get GEO test results
   ```bash
   GET /api/geo/results?city=Naples
   ```

## Keyboard Shortcuts

- **Tab Navigation**: Click tabs or use number keys (1-8)
- **Refresh**: Click 🔄 Refresh button in header
- **Command Palette**: `Cmd/Ctrl + K` (if implemented)

## First-Time User Flow

1. **Welcome**: New users see the onboarding modal automatically (if configured)
2. **Onboarding Steps**:
   - Enter dealership URL
   - First AI scan
   - Results reveal
   - Create account
3. **Dashboard Access**: After onboarding, full dashboard is available

## Testing Locally

```bash
# Start dev server
npm run dev

# Access dashboard
http://localhost:3000/dashboard

# Or via subdomain (if configured)
http://dash.localhost:3000
```

## Production URLs

- **Main Dashboard**: `https://dash.dealershipai.com` or `https://dealershipai.com/dashboard`
- **All features**: Available at the same URLs

## Troubleshooting

### Modals not opening?
- Check browser console for errors
- Verify all imports are correct
- Ensure React Query is configured

### API endpoints not working?
- Check environment variables (`DATABASE_URL`, etc.)
- Verify authentication is set up
- Check API route logs

### Styles not loading?
- Verify `styles/onboarding-modal.css` is imported in `app/globals.css`
- Check Tailwind CSS is configured
- Clear browser cache

## Next Steps

1. ✅ All features are integrated and ready
2. ✅ Header buttons provide quick access
3. ✅ Settings tab has additional options
4. 🔄 Test each feature in your environment
5. 🔄 Customize onboarding flow if needed

---

**All features are now active and ready to use!** 🎉

