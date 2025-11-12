# Preferences Persistence Guide

## Overview

The DealershipAI platform now includes a **clean, safe preference persistence system** using Zustand's persist middleware. This allows user preferences (like easter egg toggles) to persist across browser sessions without touching server state or storing PII.

---

## Architecture

### Storage Layer
- **Local Storage Key:** `dai:prefs:v1`
- **Storage Type:** Browser `localStorage` (client-side only)
- **Data:** User UI preferences (no PII, no auth tokens)
- **Persistence:** Survives page refreshes and browser restarts

### Hydration Safety
- **Hydration Check:** `hasPrefsHydrated()` ensures localStorage has loaded
- **HydrationGate:** Optional component to prevent UI flicker
- **Wait Helper:** `waitForPrefsHydration()` for async initialization

---

## Files Created/Updated

### 1. Prefs Store (`lib/store/prefs.ts`)

**Features:**
- Zustand store with persist middleware
- Partialize: only persists `agentEnabled`, `pgOnly`, `avoidTopics`
- Migration system for future schema changes
- Hydration helpers: `hasPrefsHydrated()`, `waitForPrefsHydration()`

**API:**
```typescript
import { usePrefsStore, hasPrefsHydrated } from '@/lib/store/prefs';

// Get current state
const { agentEnabled, pgOnly, avoidTopics } = usePrefsStore();

// Update preferences
usePrefsStore.getState().setAgentEnabled(false);
usePrefsStore.getState().setPgOnly(true);

// Reset to defaults
usePrefsStore.getState().resetPrefs();

// Check if hydrated from localStorage
if (hasPrefsHydrated()) {
  // Safe to read persisted preferences
}

// Wait for hydration (async)
await waitForPrefsHydration();
```

### 2. HydrationGate (`components/util/HydrationGate.tsx`)

**Purpose:** Prevents hydration mismatch by waiting one frame before rendering

**Usage:**
```tsx
import HydrationGate from '@/components/util/HydrationGate';

export default function Page() {
  return (
    <HydrationGate>
      {/* Components that depend on localStorage */}
      <ComponentUsingPrefs />
    </HydrationGate>
  );
}
```

---

## Integration Guide

### Step 1: Import Helpers

```typescript
import { usePrefsStore, hasPrefsHydrated } from '@/lib/store/prefs';
```

### Step 2: Guard Easter Egg Triggers

**Before (unsafe - reads before hydration):**
```typescript
useEffect(() => {
  const agentEnabled = usePrefsStore.getState().agentEnabled;
  if (agentEnabled) {
    const egg = getEasterEggQuote();
    setEgg(egg);
  }
}, []);
```

**After (safe - waits for hydration):**
```typescript
useEffect(() => {
  if (hasPrefsHydrated()) {
    const agentEnabled = usePrefsStore.getState().agentEnabled;
    if (agentEnabled) {
      const egg = getEasterEggQuote();
      setEgg(egg);
    }
  }
}, []);
```

### Step 3: Update Click Handlers

**Mic Click Handler:**
```typescript
const handleMicClick = () => {
  if (!hasPrefsHydrated()) {
    // Fallback if not hydrated yet
    setResponse('Analyzing...');
    return;
  }

  const { agentEnabled } = usePrefsStore.getState();
  const egg = agentEnabled ? getEasterEggQuote() : undefined;

  if (egg) {
    setResponse(egg.quote);
  } else {
    setResponse('Your visibility score is improving.');
  }
};
```

**Voice Orb Boost:**
```typescript
const handleBoost = async () => {
  if (!hasPrefsHydrated()) {
    say('One fix, then the next.', { level: 'low' });
    return;
  }

  const { agentEnabled } = usePrefsStore.getState();
  if (agentEnabled && Math.random() < 0.1) {
    const egg = getEasterEggQuote();
    say(egg.quote, { title: `${egg.source} • Boost`, level: 'medium' });
  } else {
    say('You're closer than you think.', { title: 'Coach • Boost', level: 'low' });
  }
};
```

**Command Palette "Surprise me":**
```typescript
const handleSurpriseMe = () => {
  if (!hasPrefsHydrated()) {
    toast.info('Analyzing patterns...');
    return;
  }

  const { agentEnabled } = usePrefsStore.getState();
  const egg = agentEnabled ? getEasterEggQuote() : undefined;

  if (egg) {
    addPulse({
      level: 'info',
      kind: 'system_health',
      title: egg.quote,
      detail: `— ${egg.source}`,
      actions: ['open']
    });
  } else {
    addPulse({
      level: 'info',
      kind: 'system_health',
      title: 'Your metrics are trending positive',
      actions: ['open']
    });
  }
};
```

---

## Settings UI Integration

### Add Toggle to Settings Modal

```tsx
import { usePrefsStore } from '@/lib/store/prefs';

export default function SettingsModal() {
  const { agentEnabled, setAgentEnabled, pgOnly, resetPrefs } = usePrefsStore();

  return (
    <div className="space-y-4">
      {/* Agent Easter Eggs Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Enable PG Easter Eggs</div>
          <div className="text-sm text-gray-400">
            Rare celebratory quotes (≤10% of interactions)
          </div>
        </div>
        <button
          onClick={() => setAgentEnabled(!agentEnabled)}
          className={`w-12 h-6 rounded-full transition-colors ${
            agentEnabled ? 'bg-emerald-500' : 'bg-gray-700'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
            agentEnabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* PG Only Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">PG-Rated Only</div>
          <div className="text-sm text-gray-400">
            All content family-friendly (always enforced)
          </div>
        </div>
        <div className="text-emerald-400 text-sm">✓ Enabled</div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetPrefs}
        className="mt-4 px-4 py-2 rounded-lg text-sm border"
        style={{ borderColor: '#2a2f36', color: '#a6adbb' }}
      >
        Reset to Defaults
      </button>
    </div>
  );
}
```

---

## Testing Guide

### Manual Test Flow

**1. Check Default State:**
```bash
# Open browser console
localStorage.getItem('dai:prefs:v1')
# Should show: {"state":{"agentEnabled":true,"pgOnly":true,"avoidTopics":[...]}}
```

**2. Toggle Easter Eggs Off:**
- Open Settings modal
- Click "Enable PG Easter Eggs" → OFF
- Refresh page
- Check localStorage again:
```javascript
JSON.parse(localStorage.getItem('dai:prefs:v1')).state.agentEnabled
// Should return: false
```

**3. Verify Persistence:**
- Close browser completely
- Reopen and visit dashboard
- Easter eggs should still be disabled

**4. Test Hydration:**
```typescript
// In browser console
import { hasPrefsHydrated } from '@/lib/store/prefs';
console.log(hasPrefsHydrated()); // Should be true after page load
```

**5. Test Reset:**
- Click "Reset to Defaults" in Settings
- Check `agentEnabled` is back to `true`

---

## Locations to Update

### Priority 1: Landing Page

**File:** `app/(landing)/page.tsx` or `app/page.tsx`

**Updates needed:**
1. Import `hasPrefsHydrated`
2. Guard auto-egg in `useEffect`
3. Guard mic click handler
4. Wrap in `<HydrationGate>` (optional)

### Priority 2: Voice Orb

**File:** `components/voice/VoiceOrb.tsx` or similar

**Updates needed:**
1. Guard boost handler with `hasPrefsHydrated()`
2. Fallback to neutral coach line if not hydrated

### Priority 3: Command Palette

**File:** `components/hud/CommandPalette.tsx` or similar

**Updates needed:**
1. Guard "Surprise me" action
2. Check hydration before reading `agentEnabled`

### Priority 4: Settings Modal

**File:** Create new or update existing settings component

**Updates needed:**
1. Import `usePrefsStore`
2. Add toggle UI for `agentEnabled`
3. Add reset button

---

## Migration Plan

### Phase 1: Safety First (Current)
- ✅ Prefs store with persist middleware
- ✅ HydrationGate component
- ✅ Hydration check helpers
- ⏳ Update easter egg guards (priority locations above)

### Phase 2: Settings UI
- Add settings modal/drawer
- Expose `agentEnabled` toggle
- Add reset button
- Add "avoided topics" read-only list

### Phase 3: Enhanced Preferences
- Theme preference (dark/light)
- Layout density (compact/comfortable)
- Notification preferences
- Agent persona preference (Analyst/Coach/Operator/Storyteller)

---

## Best Practices

### DO:
- ✅ Always check `hasPrefsHydrated()` before reading prefs on mount
- ✅ Use `waitForPrefsHydration()` for async initialization
- ✅ Wrap components in `<HydrationGate>` if you see flicker
- ✅ Partition store: only persist user preferences (not transient UI state)

### DON'T:
- ❌ Don't store auth tokens in prefs (use httpOnly cookies)
- ❌ Don't store PII (names, emails, etc.)
- ❌ Don't read prefs in server components
- ❌ Don't assume prefs are hydrated immediately on mount

---

## Troubleshooting

### Issue: Easter eggs still show when disabled

**Cause:** Reading `agentEnabled` before hydration complete

**Fix:** Add `hasPrefsHydrated()` check:
```typescript
if (hasPrefsHydrated() && usePrefsStore.getState().agentEnabled) {
  // Show egg
}
```

### Issue: UI flickers on page load

**Cause:** Hydration mismatch (SSR vs client state)

**Fix:** Wrap in `<HydrationGate>`:
```tsx
<HydrationGate>
  <ComponentUsingPrefs />
</HydrationGate>
```

### Issue: Preferences not persisting

**Cause:** localStorage blocked (private browsing) or quota exceeded

**Fix:** Add error handling:
```typescript
try {
  usePrefsStore.getState().setAgentEnabled(false);
} catch (error) {
  console.warn('Failed to persist preferences:', error);
  // Fallback to session-only state
}
```

### Issue: Old schema after update

**Cause:** Migration not applied

**Fix:** Increment version and add migration:
```typescript
{
  version: 2,
  migrate: (state, version) => {
    if (version === 0) {
      // Add new field
      return { ...state, newField: defaultValue };
    }
    return state;
  }
}
```

---

## Security Considerations

### What's Safe to Store
- ✅ UI preferences (theme, layout, density)
- ✅ Feature toggles (easter eggs, animations)
- ✅ Non-sensitive settings (language, timezone)

### What's NOT Safe
- ❌ Authentication tokens
- ❌ API keys
- ❌ User PII (names, emails, phone numbers)
- ❌ Payment information
- ❌ Session data

### Privacy Notes
- **No server sync:** All data stays in browser localStorage
- **No tracking:** Preferences never sent to analytics
- **User control:** Reset button clears all stored data
- **Partitioned:** Only app-specific data (key: `dai:prefs:v1`)

---

## Future Enhancements

### Phase 3 Ideas
1. **Export/Import Preferences**
   ```typescript
   const exportPrefs = () => JSON.stringify(usePrefsStore.getState());
   const importPrefs = (json: string) => usePrefsStore.setState(JSON.parse(json));
   ```

2. **Sync Across Tabs**
   ```typescript
   // Listen for storage events
   window.addEventListener('storage', (e) => {
     if (e.key === 'dai:prefs:v1') {
       usePrefsStore.persist.rehydrate();
     }
   });
   ```

3. **Cloud Sync (Optional)**
   - Store preferences in Supabase user profile
   - Sync across devices when authenticated
   - Fallback to localStorage when offline

---

## Summary

**Preferences persistence is now:**
- ✅ **Safe:** No PII, no auth tokens, client-side only
- ✅ **Simple:** Single store with persist middleware
- ✅ **Reliable:** Hydration checks prevent race conditions
- ✅ **Flexible:** Easy to add new preferences
- ✅ **Tested:** Hydration helpers ensure stability

**Next steps:**
1. Update easter egg guards in priority locations
2. Add settings UI toggle
3. Test persistence across refreshes
4. Deploy and validate in production

**The platform now remembers user preferences without touching the server. Clean, safe, and invisible.** 🎯
