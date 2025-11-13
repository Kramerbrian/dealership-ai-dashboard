# Pulse Enhanced Features Documentation

## Overview
The Pulse Decision Inbox provides real-time, actionable intelligence for dealership operations. The enhanced version includes AI-powered prioritization, real-time updates, collaboration features, and performance optimizations.

## Features

### ✅ Smart Prioritization (AI-Powered)
**Location**: [`lib/pulse/smartPrioritization.ts`](../lib/pulse/smartPrioritization.ts)

Automatically ranks Pulse cards based on:
- **Severity Score** (40% weight): Critical > High > Medium > Low > Info
- **Recency Score** (20% weight): Recent events prioritized
- **Impact Score** (20% weight): Revenue/customer impact from context
- **Action Urgency** (20% weight): Cards with immediate actions ranked higher

```typescript
import { prioritizeCards } from '@/lib/pulse/smartPrioritization';

const prioritized = prioritizeCards(cards);
// Returns cards with priorityScore and suggestedActions
```

### ✅ Real-Time Updates via SSE
**API**: [`/api/pulse/stream`](../app/api/pulse/stream/route.ts)

Server-Sent Events (SSE) provide live updates without polling:
- Connection established with `connected` event
- Updates pushed every 5 seconds with `update` event
- Heartbeat every 30 seconds to keep connection alive
- Automatic fallback to polling if SSE fails

**Usage**:
```javascript
const eventSource = new EventSource('/api/pulse/stream?filter=all&dealerId=demo');
eventSource.addEventListener('update', (e) => {
  const data = JSON.parse(e.data);
  // Handle new cards
});
```

### ✅ Virtual Scrolling Performance
**Component**: [`components/pulse/VirtualizedCardList.tsx`](../components/pulse/VirtualizedCardList.tsx)

Efficiently renders 10,000+ cards by only rendering visible items:
- **Default item height**: 120px
- **Overscan**: 5 items above/below viewport
- **Automatic container resize** handling
- **Memory efficient**: Only visible cards in DOM

**Benefits**:
- Handles large datasets without performance degradation
- Reduces initial render time
- Minimizes memory footprint

### ✅ Comments & Collaboration
**Component**: [`components/pulse/CardComments.tsx`](../components/pulse/CardComments.tsx)

Team collaboration features:
- **@Mentions**: Tag team members with auto-complete
- **Threaded Replies**: Nested conversation threads
- **Real-time Updates**: Comments sync across users
- **User Avatars**: Visual user identification

**API Integration**:
```javascript
<CardComments
  cardId={card.id}
  comments={cardComments[card.id] || []}
  currentUser={{ id: 'user-id', name: 'John Doe' }}
  onAddComment={(content, mentions) => {
    // Handle comment creation
  }}
  teamMembers={teamMembers}
/>
```

### ✅ Analytics Dashboard
**Component**: [`components/pulse/PulseAnalytics.tsx`](../components/pulse/PulseAnalytics.tsx)

Comprehensive metrics:
- **Total Cards**: Overall count
- **Critical Count**: High-priority items
- **Resolved Count**: Completed incidents
- **Last 24h/7d**: Time-based filtering
- **Trends by Type**: Distribution by kind (KPI, incident, market, system)
- **Action Frequency**: Most common actions
- **Average Resolution Time**: Performance tracking

### ✅ Export Functionality
**API**: [`/api/pulse/export`](../app/api/pulse/export/route.ts)

Export data in multiple formats:
- **JSON**: Full data export with metadata
- **CSV**: Spreadsheet-compatible format

**Supported Fields**:
- ID, Timestamp, Level, Kind
- Title, Detail, Delta
- Thread Type, Thread ID

**Usage**:
```bash
GET /api/pulse/export?format=json&filter=critical&dealerId=demo
GET /api/pulse/export?format=csv&filter=all&limit=1000
```

### ✅ Dark Mode Support
**Component**: [`components/pulse/DarkModeToggle.tsx`](../components/pulse/DarkModeToggle.tsx)

System-aware dark mode:
- Persists preference in localStorage
- Applies Tailwind dark: classes
- Smooth transitions between modes

### ✅ Keyboard Shortcuts
**Enhanced Inbox**: [`app/components/pulse/PulseInboxEnhanced.tsx`](../app/components/pulse/PulseInboxEnhanced.tsx)

Power user navigation:
- `/` - Open search
- `j/k` - Navigate cards up/down
- `1-6` - Quick filter switching
- `Enter` - Open focused card
- `Shift+Select` - Bulk selection

### ✅ Browser Notifications
Critical alerts trigger native browser notifications:
- Permission requested on first load
- Notifications for critical-level cards only
- Deduplicated by card ID

### ✅ Persistent User Preferences
Saved in localStorage:
- Selected filter
- Snoozed cards
- AI prioritization toggle
- Dark mode preference

## API Endpoints

### GET /api/pulse/stream
Real-time SSE stream of pulse cards

**Query Params**:
- `filter`: all | critical | kpi | incident | market | system
- `dealerId`: Dealership identifier

**Events**:
- `connected`: Initial connection established
- `update`: New cards available
- `heartbeat`: Connection keepalive

### GET /api/pulse/export
Export pulse cards to file

**Query Params**:
- `format`: json | csv
- `filter`: Filter type
- `dealerId`: Dealership identifier
- `limit`: Max cards (default: 1000)

### GET /api/pulse/thread/[id]
Get detailed thread information

**Query Params**:
- `dealerId`: Dealership identifier

**Response**:
```json
{
  "thread": {
    "id": "thread-123",
    "events": [...],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-02T00:00:00Z"
  }
}
```

## Component Architecture

### PulseInboxEnhanced
**Path**: `app/components/pulse/PulseInboxEnhanced.tsx`

Main container component featuring:
- State management via Zustand store
- Real-time SSE connection
- Virtual scrolling for large lists
- Bulk action support
- Analytics integration

### VirtualizedCardList
**Path**: `components/pulse/VirtualizedCardList.tsx`

Performance-optimized list renderer:
- Window-based rendering
- Dynamic height calculation
- Scroll position management

### PulseAnalytics
**Path**: `components/pulse/PulseAnalytics.tsx`

Metrics and insights dashboard:
- useMemo for computed analytics
- Responsive grid layout
- Time-based filtering

### CardComments
**Path**: `components/pulse/CardComments.tsx`

Collaboration interface:
- Mention detection with regex
- Nested reply threading
- Auto-complete for team members

## Performance Optimizations

1. **Virtual Scrolling**: Only render visible cards (10,000+ cards supported)
2. **Memoization**: useMemo for filtered cards and analytics
3. **Event Delegation**: Single onClick handler for bulk selection
4. **Lazy Loading**: Components loaded on-demand
5. **SSE vs Polling**: Reduced server load with push-based updates

## Testing Guide

### Preview Page
Access the enhanced inbox at:
```
https://dash.dealershipai.com/preview/pulse-enhanced
```

### Test Real-Time Updates
1. Open inbox in two browser tabs
2. Trigger a new pulse card via API
3. Verify both tabs update simultaneously

### Test Export
1. Click "Export" button in header
2. Select JSON or CSV format
3. Verify file downloads with correct data

### Test Analytics
1. Click "Analytics" toggle in header
2. Verify metrics match card counts
3. Check trend visualizations

### Test Collaboration
1. Add a comment with @mention
2. Verify mention appears highlighted
3. Test reply threading

## Deployment Notes

### Environment Variables
No additional env vars required beyond existing Supabase/Clerk config.

### Database Requirements
Requires Supabase function `get_pulse_inbox`:
```sql
CREATE OR REPLACE FUNCTION get_pulse_inbox(
  p_dealer_id TEXT,
  p_filter TEXT,
  p_limit INT
)
RETURNS TABLE (...) AS $$
  -- Implementation in database
$$ LANGUAGE plpgsql;
```

### Edge Runtime Compatibility
The `/api/pulse/stream` endpoint uses Edge runtime for:
- Lower latency
- Better connection handling
- Reduced memory footprint

## Future Enhancements

- [ ] WebSocket support for bidirectional communication
- [ ] AI-powered auto-resolution suggestions
- [ ] Advanced filtering (date range, custom queries)
- [ ] Pulse card templates
- [ ] Mobile app integration
- [ ] Slack/Teams notifications
- [ ] Custom dashboards and widgets
- [ ] Machine learning for pattern detection

## Troubleshooting

### Issue: SSE Connection Fails
**Symptom**: "🔴 Offline" indicator in header

**Solutions**:
1. Check browser console for errors
2. Verify `/api/pulse/stream` returns 200
3. Check Clerk authentication
4. Verify Supabase connection

### Issue: Virtual Scrolling Not Working
**Symptom**: All cards render at once

**Solutions**:
1. Verify card count > 50 (threshold for virtualization)
2. Check container has defined height
3. Inspect itemHeight prop matches actual card height

### Issue: Export Downloads Empty File
**Symptom**: File downloads but contains no data

**Solutions**:
1. Verify cards exist for selected filter
2. Check browser console for API errors
3. Verify Clerk authentication
4. Check Supabase permissions

## References

- Pulse Store: [`lib/store/pulse-store.ts`](../lib/store/pulse-store.ts)
- Pulse Types: [`lib/types/pulse.ts`](../lib/types/pulse.ts)
- Smart Prioritization: [`lib/pulse/smartPrioritization.ts`](../lib/pulse/smartPrioritization.ts)
