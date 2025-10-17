# 🔴 Admin Live Status Integration Guide

## Overview

The AdminLiveStatus component provides real-time system monitoring for superadmins. It shows server health, performance metrics, and system status in a floating widget that's only visible to authorized users.

## 🚀 Quick Integration

### Option 1: Add to Existing Dashboard (Recommended)

```tsx
// app/dashboard/page.tsx (or any dashboard page)
import AdminLiveStatus from '@/app/components/AdminLiveStatus';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your existing dashboard content */}
      
      {/* Admin Live Status Widget - Add this line */}
      <AdminLiveStatus />
    </div>
  );
}
```

### Option 2: Full Admin Route

```tsx
// app/admin/page.tsx
import AdminLiveStatus from '@/app/components/AdminLiveStatus';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Full admin interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin panels */}
        </div>
      </div>
      
      <AdminLiveStatus />
    </div>
  );
}
```

## 🔧 Configuration

### Admin Access Control

The component automatically checks for admin status using these methods (in order):

1. **localStorage flag**: `localStorage.getItem('isAdmin') === 'true'`
2. **User role**: `localStorage.getItem('userRole') === 'admin'` or `'superadmin'`
3. **Custom auth**: Replace the `checkAdminStatus` function with your auth system

```tsx
// Customize admin check in AdminLiveStatus.tsx
const checkAdminStatus = () => {
  // Replace with your auth logic
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  setIsVisible(isAdmin);
};
```

### API Endpoint Configuration

The component fetches data from `/api/admin/status`. Ensure this endpoint is properly configured:

```typescript
// app/api/admin/status/route.ts
export async function GET(req: NextRequest) {
  // Your admin status logic
  return NextResponse.json({
    server: 'online',
    port: 3000,
    uptime: '2h 15m',
    connections: 42,
    memory: { used: 1024, total: 2048 },
    cpu: 15.2
  });
}
```

## 🎨 Customization

### Styling

The component uses Tailwind CSS classes. Customize colors and positioning:

```tsx
// Change widget position
<div className="fixed bottom-4 right-4 z-50"> {/* Default */}
<div className="fixed top-4 right-4 z-50">   {/* Top-right */}
<div className="fixed bottom-4 left-4 z-50"> {/* Bottom-left */}

// Change status colors
const getStatusColor = () => {
  switch (status.server) {
    case 'online': return 'border-green-500 bg-green-50';
    case 'degraded': return 'border-yellow-500 bg-yellow-50';
    case 'offline': return 'border-red-500 bg-red-50';
  }
};
```

### Auto-refresh Interval

```tsx
// Change refresh rate (default: 5 seconds)
const interval = setInterval(fetchStatus, 5000); // 5 seconds
const interval = setInterval(fetchStatus, 10000); // 10 seconds
```

## 📊 Status Indicators

### Server Status
- 🟢 **Online**: All systems operational
- 🟡 **Degraded**: Performance issues detected
- 🔴 **Offline**: Server unavailable

### Metrics Displayed
- **Port**: Server port number
- **Uptime**: How long server has been running
- **Connections**: Active connections
- **Memory**: RAM usage (used/total)
- **CPU**: CPU usage percentage
- **Last Update**: Timestamp of last status check

## 🔒 Security Considerations

### Admin-Only Visibility
- Component only renders for authorized users
- API endpoint should validate admin permissions
- Consider rate limiting for status checks

### Data Sensitivity
- Memory and CPU data is system-level information
- Consider if this should be restricted to superadmins only
- Log admin status access for audit trails

## 🚨 Troubleshooting

### Widget Not Appearing
1. Check admin status in localStorage: `localStorage.setItem('isAdmin', 'true')`
2. Verify API endpoint is accessible: `curl /api/admin/status`
3. Check browser console for errors

### Status Not Updating
1. Verify API endpoint returns valid JSON
2. Check network tab for failed requests
3. Ensure auto-refresh interval is running

### Performance Issues
1. Increase refresh interval if too frequent
2. Optimize API endpoint response time
3. Consider caching status data

## 📱 Mobile Responsiveness

The widget is designed to work on mobile devices:
- Touch-friendly button size (48px minimum)
- Responsive panel width
- Proper z-index for overlay

## 🔄 Integration with Other Components

### With BotParityDiffViewer
```tsx
// Show bot parity status in admin widget
const [botStatus, setBotStatus] = useState(null);

// Add to status API response
{
  server: 'online',
  botParity: {
    googlebot: 'healthy',
    gptbot: 'missing_schema',
    bingbot: 'healthy'
  }
}
```

### With APIUsageChart
```tsx
// Show API usage in admin panel
import APIUsageChart from '@/app/components/APIUsageChart';

// In admin dashboard
<APIUsageChart points={apiUsageData} />
```

## 🎯 Best Practices

1. **Minimal Data**: Only show essential system metrics
2. **Fast Response**: Keep API endpoint lightweight
3. **Error Handling**: Graceful degradation when status unavailable
4. **Accessibility**: Proper ARIA labels and keyboard navigation
5. **Performance**: Don't impact main dashboard performance

## 🔮 Future Enhancements

- **Real-time WebSocket**: Live updates without polling
- **Alert Integration**: Connect to monitoring systems
- **Historical Data**: Show trends over time
- **Custom Metrics**: Add business-specific KPIs
- **Multi-server**: Support for multiple server instances

---

## Quick Test

```bash
# Enable admin mode in browser console
localStorage.setItem('isAdmin', 'true');

# Refresh page - widget should appear in bottom-right
# Click widget to expand and see system status
```

**Your admin monitoring is now live!** 🎉
