# 🚀 Quick Start: API-Connected Dashboard

## Get Started in 3 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# The .env.local file is already configured with:
NEXT_PUBLIC_API_URL=https://dash.dealershipai.com
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dash.dealershipai.com
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. View the Dashboard
Open your browser to:
```
http://localhost:3000/dash
```

## What You'll See

### Live Dashboard Features
- **Real-time Metrics**: AI visibility scores, revenue data, leads, performance
- **Auto-Refresh**: Data updates every 60 seconds automatically
- **Interactive UI**: Click on cards for detailed views
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error recovery with retry buttons

### Available Tabs
1. **Overview** - Complete dashboard with all key metrics
2. **AI Health** - AI platform performance (ChatGPT, Claude, Perplexity, Gemini)
3. **Settings** - Time range selector and configuration

## API Endpoints Available

All endpoints are live and working:

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `/api/health` | System health | `curl localhost:3000/api/health` |
| `/api/dashboard/overview` | Dashboard data | Real-time metrics |
| `/api/ai/visibility-index` | AI scores | Platform visibility |
| `/api/dashboard/website` | Performance | Core Web Vitals |
| `/api/dashboard/schema` | Schema data | Markup opportunities |
| `/api/dashboard/reviews` | Reviews | Sentiment analysis |

## Test the Integration

### Quick Test
```bash
# Run automated tests
./scripts/test-api-integration.sh
```

### Manual Test
```bash
# Test dashboard overview
curl "http://localhost:3000/api/dashboard/overview?dealerId=lou-grubbs-motors&timeRange=30d"

# Test AI visibility
curl "http://localhost:3000/api/ai/visibility-index?dealerId=lou-grubbs-motors"
```

## Key Features Working

✅ **Real-time Data Fetching**
- All API endpoints connected
- Data refreshes every 60 seconds
- Manual refresh button available

✅ **Loading States**
- Branded loading spinner
- Smooth transitions
- Progress indicators

✅ **Error Handling**
- Error boundaries
- Retry mechanisms
- User-friendly error messages

✅ **Type Safety**
- Full TypeScript support
- Type-safe API responses
- IntelliSense support

## Using the API Client

### In Your Components

```typescript
import { useDashboardOverview } from '@/lib/hooks/useDashboardData';

function MyComponent() {
  const { data, loading, error, refetch } = useDashboardOverview({
    dealerId: 'lou-grubbs-motors',
    timeRange: '30d'
  });

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <h2>AI Score: {data.aiVisibility.score}</h2>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  );
}
```

### Direct API Calls

```typescript
import { dashboardAPI } from '@/lib/api/dashboard-client';

// Fetch data directly
const data = await dashboardAPI.getDashboardOverview({
  dealerId: 'lou-grubbs-motors',
  timeRange: '30d'
});

console.log(data.aiVisibility.score);
```

## Next Steps

### For Development
1. Open `app/dash/page.tsx` to see the dashboard
2. Edit `lib/api/dashboard-client.ts` to add new endpoints
3. Create new hooks in `lib/hooks/useDashboardData.ts`

### For Production
1. Update environment variables in Vercel
2. Deploy with `vercel --prod`
3. Monitor at `https://dash.dealershipai.com`

## Troubleshooting

**Dashboard not loading?**
- Check if dev server is running: `npm run dev`
- Verify port 3000 is not in use
- Check browser console for errors

**API errors?**
- Run health check: `curl localhost:3000/api/health`
- Check network tab in DevTools
- Review server logs in terminal

**TypeScript errors?**
- Run type check: `npm run type-check`
- Update interfaces in `dashboard-client.ts`

## Documentation

- 📄 **Complete Guide**: `DASH_API_CONNECTION_COMPLETE.md`
- 🧪 **Testing**: `scripts/test-api-integration.sh`
- 🔧 **API Client**: `lib/api/dashboard-client.ts`
- 🎣 **React Hooks**: `lib/hooks/useDashboardData.ts`

## Support

Need help?
- Check the documentation files
- Review browser console
- Examine network requests
- Check server logs

---

**Status: ✅ Ready to Use**

Everything is configured and working! Start the dev server and visit `/dash` to see it in action.
