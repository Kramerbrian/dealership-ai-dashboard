# Pulse Decision Inbox - Next Steps

## Current State

✅ **What's Working:**
- Basic PulseInbox component (`app/components/pulse/PulseInbox.tsx`)
- API routes for ingestion and fetching (`/api/pulse`)
- Database schema with deduplication and auto-promotion
- Thread drawer functionality
- Filtering (all, critical, kpi, incident, market, system)
- Basic actions (open, fix, assign, snooze, mute)
- Smart prioritization library (`lib/pulse/smartPrioritization.ts`)

## Recommended Next Steps

### 1. **Integrate Smart Prioritization** (High Impact, Low Effort)
**Status:** Library exists, needs integration

**Implementation:**
- Add prioritization toggle to `InboxHeader`
- Apply `prioritizeCards()` to filtered results
- Display priority scores on cards
- Show suggested actions from prioritization

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`
- `app/components/pulse/InboxHeader.tsx`

**Estimated time:** 1-2 hours

---

### 2. **Real-Time Updates with SSE** (High Impact, Medium Effort)
**Status:** Currently polling every 10 seconds

**Implementation:**
- Create `/api/pulse/stream` endpoint with Server-Sent Events
- Replace polling with SSE connection
- Show connection status indicator
- Handle reconnection logic

**Files to create:**
- `app/api/pulse/stream/route.ts`

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`

**Estimated time:** 2-3 hours

---

### 3. **Keyboard Navigation** (Medium Impact, Low Effort)
**Status:** Not implemented

**Implementation:**
- `j`/`k` for navigation
- `/` for search
- `Enter` to open thread
- `1-6` for filter shortcuts
- `Cmd/Ctrl+A` for bulk select

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`

**Estimated time:** 1-2 hours

---

### 4. **Advanced Search & Filtering** (Medium Impact, Medium Effort)
**Status:** Basic filtering exists

**Implementation:**
- Search by title, detail, context
- Filter by date range
- Filter by KPI type
- Save filter preferences to localStorage

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`
- `app/components/pulse/InboxHeader.tsx`

**Estimated time:** 2-3 hours

---

### 5. **Bulk Actions** (Medium Impact, Medium Effort)
**Status:** Not implemented

**Implementation:**
- Multi-select cards (checkbox or Cmd/Ctrl+A)
- Bulk fix, assign, snooze, mute
- Bulk action toolbar
- Selection persistence

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`

**Estimated time:** 2-3 hours

---

### 6. **Performance Optimization** (High Impact, High Effort)
**Status:** No optimization for large lists

**Implementation:**
- Virtual scrolling for 100+ cards
- Memoization of filtered results
- Lazy loading of thread data
- Debounced search

**Files to create:**
- `components/pulse/VirtualizedCardList.tsx`

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`

**Estimated time:** 3-4 hours

---

### 7. **Comments & Collaboration** (Low Impact, High Effort)
**Status:** Not implemented

**Implementation:**
- Comments on cards/threads
- @mentions with autocomplete
- Reply functionality
- Team member suggestions

**Files to create:**
- `components/pulse/CardComments.tsx`
- `app/api/pulse/comments/route.ts`

**Files to modify:**
- `app/components/pulse/ThreadDrawer.tsx`

**Estimated time:** 4-5 hours

---

### 8. **Analytics Dashboard** (Medium Impact, Medium Effort)
**Status:** Basic digest banner exists

**Implementation:**
- Trends over time
- Action frequency
- Resolution time metrics
- KPI impact analysis
- Export to CSV/JSON

**Files to create:**
- `components/pulse/PulseAnalytics.tsx`
- `app/api/pulse/analytics/route.ts`
- `app/api/pulse/export/route.ts`

**Estimated time:** 3-4 hours

---

### 9. **Dark Mode** (Low Impact, Low Effort)
**Status:** Not implemented

**Implementation:**
- Theme toggle component
- Dark mode styles throughout
- Persist preference to localStorage
- Respect system preference

**Files to create:**
- `components/pulse/DarkModeToggle.tsx`

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`
- `app/components/pulse/InboxHeader.tsx`

**Estimated time:** 1-2 hours

---

### 10. **Browser Notifications** (Low Impact, Low Effort)
**Status:** Not implemented

**Implementation:**
- Request notification permission
- Show notifications for critical cards
- Notification click opens thread
- Respect DND mode

**Files to modify:**
- `app/components/pulse/PulseInbox.tsx`

**Estimated time:** 1 hour

---

## Quick Wins (Do First)

1. **Smart Prioritization** - Library exists, just needs integration
2. **Keyboard Navigation** - Quick UX improvement
3. **Dark Mode** - Easy win for user preference
4. **Browser Notifications** - Simple but impactful

## High-Value Features (Do Next)

1. **Real-Time Updates (SSE)** - Better UX than polling
2. **Performance Optimization** - Critical for scale
3. **Advanced Search** - Improves usability
4. **Bulk Actions** - Saves time for power users

## Nice-to-Have (Do Later)

1. **Comments & Collaboration** - Team features
2. **Analytics Dashboard** - Insights and reporting

---

## Implementation Priority

### Phase 1: Quick Wins (This Week)
- [ ] Smart Prioritization integration
- [ ] Keyboard navigation
- [ ] Dark mode toggle
- [ ] Browser notifications

### Phase 2: High Value (Next Week)
- [ ] Real-time updates (SSE)
- [ ] Performance optimization (virtual scrolling)
- [ ] Advanced search & filtering
- [ ] Bulk actions

### Phase 3: Polish (Following Week)
- [ ] Analytics dashboard
- [ ] Comments & collaboration
- [ ] Export functionality

---

## Getting Started

To implement any of these features:

1. **Choose a feature** from the list above
2. **Review the existing code** in `app/components/pulse/PulseInbox.tsx`
3. **Check the API** in `app/api/pulse/route.ts`
4. **Implement incrementally** - test as you go
5. **Update this document** as features are completed

---

## Questions?

- Which feature should we tackle first?
- Do you want to prioritize UX improvements or performance?
- Should we focus on individual features or create an "enhanced" version?

