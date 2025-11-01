# ⚡ SSE Stream Quick Start

## 🎯 What's Included

- ✅ **Event Bus** (`lib/events/bus.ts`) - Singleton for server-side events
- ✅ **SSE Endpoint** (`app/api/ai-scores/stream/route.ts`) - Real-time stream
- ✅ **Client Hook** (`lib/client/useAiScoreStream.ts`) - React subscription
- ✅ **MSRP Sync** (`lib/jobs/msrpSync.ts`) - Auto-emits MSRP changes
- ✅ **Score Engine** (`lib/intel/score-engine.ts`) - Auto-emits score updates
- ✅ **RaR Modal** (`app/(dashboard)/intelligence/widgets/RaRModal.tsx`) - Live modal

---

## 🚀 Usage

### **Subscribe to Events**

```tsx
import { subscribeAiScores } from '@/lib/client/useAiScoreStream';

useEffect(() => {
  const unsub = subscribeAiScores(
    { dealerId: 'dealer123' },
    (evt) => {
      if (evt.type === 'ai-score') {
        console.log('Score updated:', evt.data);
        // Update your tile/component
      }
    }
  );
  return unsub;
}, []);
```

### **Emit Events (Server-Side)**

```typescript
import { bus } from '@/lib/events/bus';

// MSRP change
bus.emit('msrp:change', {
  vin: '1ABC123',
  old: 45000,
  new: 43000,
  deltaPct: -4.44,
  ts: new Date().toISOString()
});

// AI score update
bus.emit('ai-scores:update', {
  vin: '1ABC123',
  dealerId: 'dealer123',
  reason: 'MSRP_Update',
  avi: 66,
  ati: 72,
  cis: 69,
  ts: new Date().toISOString()
});
```

---

## 🧪 Test

```bash
# Connect to stream
curl -N "http://localhost:3000/api/ai-scores/stream?dealerId=dealer123"

# Fire test event (in Node)
node -e "require('./lib/events/bus').bus.emit('ai-scores:update', { vin: '1ABC', reason: 'TEST', avi: 66, ati: 72, cis: 69, ts: new Date().toISOString() });"
```

---

## 📍 RaR Modal Location

The RaR modal is now accessible from the **dAI Cognitive Control Center** dashboard:

- **Route**: `/dash`
- **Trigger**: Click the "⚠️ Revenue at Risk" card in the Overview tab
- **Grid**: Changed from `grid-3` to `grid-4` to accommodate RaR card

---

**✅ Ready!** Tiles will nudge live when MSRP deltas and score recomputes hit. 🎉

