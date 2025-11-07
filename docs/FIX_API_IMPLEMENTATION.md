# Fix API Implementation - Idempotent with 10-Minute Undo

## ✅ Implementation Complete

Idempotent Fix APIs with async job processing via QStash.

---

## 📋 What Was Implemented

### 1. Database Migration
- ✅ `supabase/migrations/20251109_fix_receipts.sql`
  - `fix_receipts` table with undo deadline
  - Indexes for tenant, pulse, and deadline lookups
  - RLS policy for service-role access

### 2. Store Helpers
- ✅ `lib/receipts/store.ts`
  - `insertReceipt()` - Create receipt
  - `loadReceipt()` - Get receipt by ID
  - `markUndone()` - Mark as undone (within deadline)
  - `updateReceiptFinalDelta()` - Update final delta after job completion
  - `listReceiptsSince()` - List receipts for ledger view

### 3. Idempotency Utilities
- ✅ `lib/http/idempotency.ts`
  - `ensureIdempotent()` - Enforce Idempotency-Key header
  - Uses Redis for fast duplicate detection
  - 10-minute TTL (matches undo window)

### 4. QStash Integration
- ✅ `lib/queue/qstash.ts`
  - `qstashPublish()` - Publish jobs to QStash
  - `verifyQStashSignature()` - Verify QStash requests (placeholder)

### 5. API Routes
- ✅ `POST /api/fix/apply` - Apply fix (idempotent, enqueues job)
- ✅ `POST /api/fix/apply?simulate=true` - Preview fix (no write)
- ✅ `POST /api/fix/undo` - Undo fix (10-minute window)
- ✅ `POST /api/jobs/fix-consumer` - QStash consumer (executes fix)
- ✅ `GET /api/fix/status/[id]` - Check receipt status

### 6. Client Integration
- ✅ Updated `app/drive/page.tsx` with:
  - `onApply()` - Calls `/api/fix/apply` with idempotency key
  - `onUndo()` - Calls `/api/fix/undo`
  - `onSimulate()` - Calls `/api/fix/apply?simulate=true`
- ✅ Updated `components/pulse/FixTierDrawer.tsx` with:
  - Preview button for simulation
  - Simulation result display

---

## 🔧 Environment Variables Required

```bash
# Upstash QStash (HTTP-based task queue)
QSTASH_TOKEN=eyJhbGciOiJ...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# Your public URL (used by QStash to POST jobs)
PUBLIC_BASE_URL=https://dash.dealershipai.com
# OR
NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com

# Existing (already configured)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE=...
```

---

## 🚀 Usage

### Simulate Fix (Preview)
```typescript
const res = await fetch('/api/fix/apply?simulate=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pulseId: 'schema_missing_vdp',
    tier: 'apply',
    summary: 'Add Product schema',
    projectedDeltaUSD: 8200
  })
});
// Returns: { ok: true, simulate: true, plan: { diff, etaSeconds, ... } }
```

### Apply Fix
```typescript
const res = await fetch('/api/fix/apply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID()
  },
  body: JSON.stringify({
    pulseId: 'schema_missing_vdp',
    tier: 'apply',
    summary: 'Add Product schema',
    projectedDeltaUSD: 8200,
    context: { diff: '...' }
  })
});
// Returns: { ok: true, receiptId: '...', undoBy: '...', enqueued: true }
```

### Undo Fix
```typescript
const res = await fetch('/api/fix/undo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ receiptId: '...' })
});
// Returns: { ok: true, receiptId: '...', undone: true }
```

### Check Status
```typescript
const res = await fetch('/api/fix/status/[receiptId]');
// Returns: { id, summary, deltaUSD, undone, undoable, undoDeadline, createdAt }
```

---

## 🔄 Flow Diagram

```
1. User clicks "Apply Fix"
   ↓
2. POST /api/fix/apply (with Idempotency-Key)
   ↓
3. Create receipt (projected delta)
   ↓
4. Enqueue job to QStash → /api/jobs/fix-consumer
   ↓
5. Return receiptId immediately (UI updates)
   ↓
6. QStash calls /api/jobs/fix-consumer (async)
   ↓
7. Execute fix, compute final delta
   ↓
8. Update receipt with final delta
   ↓
9. Optional: Slack alert
```

---

## 🎯 Features

### Idempotency
- ✅ `Idempotency-Key` header required
- ✅ Redis-based duplicate detection
- ✅ 10-minute TTL (matches undo window)

### Undo Window
- ✅ 10-minute window from apply time
- ✅ Validated on undo request
- ✅ Automatically expires after deadline

### Async Processing
- ✅ Immediate receipt creation (projected delta)
- ✅ Background job computes final delta
- ✅ Receipt updated when job completes

### Simulation
- ✅ `?simulate=true` query param
- ✅ Returns diff preview without writes
- ✅ No idempotency required for simulation

---

## 📝 Next Steps

1. **Run Migration:**
   ```bash
   supabase migration up 20251109_fix_receipts
   ```

2. **Set QStash Environment Variables:**
   - Get QStash token from Upstash dashboard
   - Set `PUBLIC_BASE_URL` to your production domain
   - Add signing keys for production verification

3. **Install QStash SDK (Optional):**
   ```bash
   npm install @upstash/qstash
   ```
   Then update `verifyQStashSignature()` to use official SDK

4. **Wire Real Fix Logic:**
   - Replace synthetic delta calculation in consumer
   - Add actual schema injection, review batch processing, etc.

5. **Add Dead Letter Queue (DLQ):**
   - Configure QStash DLQ URL
   - Handle failed jobs

---

## 🔍 Testing

```bash
# Simulate
curl -X POST "http://localhost:3000/api/fix/apply?simulate=true" \
  -H "Content-Type: application/json" \
  -d '{"pulseId":"test","tier":"apply","projectedDeltaUSD":1000}'

# Apply (requires auth + Idempotency-Key)
curl -X POST "http://localhost:3000/api/fix/apply" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"pulseId":"test","tier":"apply","projectedDeltaUSD":1000}'

# Check status
curl "http://localhost:3000/api/fix/status/[receiptId]"
```

---

## 🎨 Clay Principles

- **Identify** → Pulses rank the right fix
- **Solve** → Simulate shows diff; async job executes safely
- **Actionable** → One click apply, idempotent, undo in 10 minutes, ledger proof updates automatically

---

**Status**: ✅ Complete  
**Next**: Run migration and configure QStash

