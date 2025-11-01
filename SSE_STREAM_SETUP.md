# 🚀 SSE Stream Setup - Live Tile Updates

Complete setup for real-time AI score and MSRP change updates via Server-Sent Events (SSE).

---

## ✅ Files Created

### **Event Bus**
- ✅ `lib/events/bus.ts` - Singleton EventEmitter for server-side events

### **SSE Endpoint**
- ✅ `app/api/ai-scores/stream/route.ts` - SSE stream endpoint with filtering

### **Client Hook**
- ✅ `lib/client/useAiScoreStream.ts` - React hook for subscribing to events

### **Event Emitters**
- ✅ `lib/jobs/msrpSync.ts` - Emits MSRP change events
- ✅ `lib/intel/score-engine.ts` - Emits AI score update events

### **Live Components**
- ✅ `app/components/DealerAiTileLive.tsx` - Example live tile component

---

## 🎯 How It Works

### **1. Event Bus (Server-Side)**

The singleton event bus allows any server-side code to emit events:

```typescript
import { bus } from '@/lib/events/bus';

// Emit MSRP change
bus.emit('msrp:change', {
  vin: '1ABC123',
  old: 45000,
  new: 43000,
  deltaPct: -4.44,
  ts: new Date().toISOString()
});

// Emit AI score update
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

### **2. SSE Stream**

Clients connect to `/api/ai-scores/stream` and receive events:

- **All dealers**: `/api/ai-scores/stream`
- **Dealer-only**: `/api/ai-scores/stream?dealerId=STORE123`
- **Specific VIN**: `/api/ai-scores/stream?vin=1ABC`

Event types:
- `hello` - Initial connection message
- `ai-score` - AI score update
- `msrp` - MSRP change
- `hb` - Heartbeat (every 25s)

### **3. Client Subscription**

Use the hook in your components:

```tsx
import { subscribeAiScores } from '@/lib/client/useAiScoreStream';

useEffect(() => {
  const unsub = subscribeAiScores(
    { dealerId: 'dealer123' },
    (evt) => {
      if (evt.type === 'ai-score') {
        console.log('Score updated:', evt.data);
      } else if (evt.type === 'msrp') {
        console.log('MSRP changed:', evt.data);
      }
    }
  );
  return unsub;
}, []);
```

---

## 🔧 Integration Points

### **MSRP Sync Integration**

When MSRP changes are detected (e.g., in nightly sync), emit events:

```typescript
// In your MSRP sync job
import { syncMSRPRecords } from '@/lib/jobs/msrpSync';

const records = await fetchLatestMSRP();
const changes = await syncMSRPRecords(records);
// Events are automatically emitted for each change
```

### **AI Score Recompute Integration**

When scores are recomputed (e.g., after MSRP update), emit events:

```typescript
// In your score recompute job
import { recomputeAiScores } from '@/lib/intel/score-engine';

const results = await recomputeAiScores({
  vins: ['1ABC123', '2DEF456'],
  dealerId: 'dealer123',
  reason: 'MSRP_Update'
});
// Events are automatically emitted for each VIN
```

---

## 🧪 Testing

### **Test SSE Stream**

```bash
# Connect to stream
curl -N "http://localhost:3000/api/ai-scores/stream?vin=1ABC"

# Should see:
# event: hello
# data: {"ok":true,"vin":"1ABC","ts":"2025-11-01T12:00:00.000Z"}
```

### **Test Event Emission**

```typescript
// In Node REPL or test script
import { bus } from './lib/events/bus';

bus.emit('ai-scores:update', {
  vin: '1ABC',
  reason: 'TEST',
  avi: 66,
  ati: 72,
  cis: 69,
  ts: new Date().toISOString()
});

// Should appear in connected SSE clients
```

---

## 📊 Example: Live Tile Component

The `DealerAiTileLive` component automatically updates when scores change:

```tsx
import { DealerAiTileLive } from '@/app/components/DealerAiTileLive';

<DealerAiTileLive dealerId="dealer123" />
```

This tile:
- Connects to SSE stream on mount
- Receives `ai-score` events
- Computes rolling average of AVI/ATI/CIS
- Updates UI instantly when new scores arrive

---

## 🚀 Scaling to Multiple Instances

For multi-instance deployments, replace the in-memory bus with Redis Pub/Sub:

```typescript
import Redis from 'ioredis';
import { bus } from '@/lib/events/bus';

const redis = new Redis(process.env.REDIS_URL);

// Subscribe to Redis
redis.subscribe('ai-scores:update', 'msrp:change');

redis.on('message', (channel, message) => {
  const data = JSON.parse(message);
  bus.emit(channel, data); // Forward to local clients
});

// When emitting, also publish to Redis
const originalEmit = bus.emit.bind(bus);
bus.emit = (event: string, data: any) => {
  originalEmit(event, data);
  redis.publish(event, JSON.stringify(data));
};
```

---

## ✅ Status

- ✅ Event bus singleton created
- ✅ SSE endpoint with filtering
- ✅ Client subscription hook
- ✅ MSRP sync event emitter
- ✅ AI score recompute event emitter
- ✅ Example live tile component
- ✅ RaR modal integrated into dashboard

**Ready to stream!** Tiles will update instantly when MSRP changes or scores recompute. 🎉

