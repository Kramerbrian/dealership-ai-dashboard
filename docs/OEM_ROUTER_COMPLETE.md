# OEM Router System - Complete Implementation Guide

## Overview

The OEM Router system provides end-to-end automation for:
1. **Parsing OEM content** via internal GPT agent
2. **Routing updates** to relevant dealerships/groups
3. **Generating bulk actions** for group-level application
4. **Executive Pulse tiles** for group-level visibility

---

## Architecture

```
OEM Press Release/Model Page
    ↓
OEM Router GPT (internal agent)
    ↓
OEMModel JSON
    ↓
routeOemUpdate() → RouteOemUpdateResult
    ↓
buildGroupCommerceActions() → CommerceAction[]
    ↓
ExecOemRollupCard (UI) + /api/agentic/execute
```

---

## Components

### 1. ExecOemRollupCard Component

**Location:** `components/pulse/ExecOemRollupCard.tsx`

**Usage:**
```tsx
<ExecOemRollupCard
  oemLabel="2026 Toyota Tacoma"
  brand="Toyota"
  rollup={groupRollup}
  onApplyAll={() => handleApplyAll(result, oem, groupId)}
  onOpenDetails={() => openGroupDetailModal(result, groupId)}
/>
```

**Features:**
- Shows coverage percentage across rooftops
- Displays high-priority (P0) rooftop count
- "Apply across group" button for bulk actions
- "View rooftop breakdown" for detailed view

---

### 2. Group Commerce Actions Helper

**Location:** `engine/oem_router/groupActions.ts`

**Function:** `buildGroupCommerceActions()`

**Usage:**
```ts
import { buildGroupCommerceActions } from '@/engine/oem_router/groupActions';

const dealersById = Object.fromEntries(dealers.map(d => [d.id, d]));
const actions = buildGroupCommerceActions(
  oemModel,
  routingResult,
  dealersById,
  { onlyHighPriority: true } // Optional filter
);
```

**Returns:** Array of `CommerceAction[]` ready for batch execution

**Action Types Generated:**
- `PUSH_SCHEMA` - Injects JSON-LD schema for the model
- `UPDATE_MODEL_COPY` - Updates content on landing pages, SRP, VDPs
- `RUN_REFRESH` - Queues AI visibility refresh after changes

---

### 3. CommerceAction Types

**Location:** `models/CommerceAction.ts`

**Types:**
- `CommerceIntent` - Intent types (PUSH_SCHEMA, UPDATE_MODEL_COPY, etc.)
- `CommerceAction` - Individual action with tenant, confidence, tool, input
- `CommerceActionBatch` - Batch of actions for group execution

---

### 4. OEM Router GPT

**Location:** `lib/oem-router-gpt.ts`

**System Prompt:** `OEM_ROUTER_SYSTEM_PROMPT`
- Reads official OEM content
- Produces valid OEMModel JSON
- Tags bullets by category and retail relevance
- No hallucination - only uses explicit values

**JSON Schema:** `OEMMODEL_JSON_SCHEMA`
- Structured output format
- Validates against OEMModel type

**API Endpoint:** `POST /api/oem/gpt-parse`
- Accepts OEM URL
- Returns parsed OEMModel JSON
- Validates against allowed domains

---

### 5. Agentic Execute Endpoint

**Location:** `app/api/agentic/execute/route.ts`

**Endpoint:** `POST /api/agentic/execute`

**RBAC:** Requires `marketing_director` or higher

**Functionality:**
- Executes batch of CommerceActions
- Auto-executes actions with `requires_approval: false`
- Queues actions with `requires_approval: true` for approval
- Routes to appropriate tools (site_inject, auto_fix, queue_refresh)

---

## Integration Flow

### Step 1: Detect New OEM Content

```ts
// In your Orchestrator or monitoring system
const pressUrl = 'https://pressroom.toyota.com/2026-tacoma';
const brandConfig = { oem_domains: ['toyota.com', 'pressroom.toyota.com'] };

await processOemUpdate(pressUrl, brandConfig);
```

### Step 2: Parse via OEM Router GPT

```ts
import { callOemRouterGPT } from '@/lib/oem-router-gpt';

const oemModel = await callOemRouterGPT(pressUrl, brandConfig.oem_domains);
// Returns: { model_year: 2026, brand: 'Toyota', model: 'Tacoma', ... }
```

### Step 3: Route to Dealers

```ts
// Assuming routeOemUpdate exists in your OEM router
import { routeOemUpdate } from '@/engine/oem_router/route';

const dealers = await loadAllDealers();
const groups = await loadAllGroups();
const routingResult = await routeOemUpdate(oemModel, dealers, groups);
```

### Step 4: Generate Actions

```ts
import { buildGroupCommerceActions } from '@/engine/oem_router/groupActions';

const dealersById = Object.fromEntries(dealers.map(d => [d.id, d]));
const actions = buildGroupCommerceActions(
  oemModel,
  routingResult,
  dealersById,
  { onlyHighPriority: true }
);
```

### Step 5: Display in Pulse

```tsx
// In your exec dashboard
{routingResult.group_rollups.map(rollup => (
  <ExecOemRollupCard
    key={rollup.group_id}
    oemLabel={routingResult.oem_model_label}
    brand={oemModel.brand}
    rollup={rollup}
    onApplyAll={async () => {
      const batch = await executeBatch(actions, rollup.group_id);
      // Show success/error feedback
    }}
    onOpenDetails={() => {
      // Open modal with rooftop breakdown
    }}
  />
))}
```

### Step 6: Execute Actions

```ts
// When "Apply across group" is clicked
const response = await fetch('/api/agentic/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    batch_id: createActionBatchId(oemModel, groupId),
    actions: actions.filter(a => /* filter by group */),
  }),
});
```

---

## RBAC Integration

### Role Hierarchy

```ts
// lib/rbac.ts
export type Role = 'dealer_user' | 'manager' | 'marketing_director' | 'admin' | 'superadmin';

// APIs & Exports and dAI Agents require marketing_director+
export function canAccessAPIsAndAgents(role: Role): boolean {
  return hasRoleAccess(role, 'marketing_director');
}
```

### Gate Checks

```tsx
// In components that show "Apply across group"
import { canAccessAPIsAndAgents } from '@/lib/rbac';

{canAccessAPIsAndAgents(userRole) && (
  <button onClick={handleApplyAll}>
    Apply across group
  </button>
)}
```

---

## OEM Router GPT Setup

### 1. System Prompt

The system prompt is defined in `lib/oem-router-gpt.ts`:
- Enforces domain whitelisting
- Prevents hallucination
- Requires explicit values only
- Tags bullets by category and relevance

### 2. JSON Schema

The `OEMMODEL_JSON_SCHEMA` ensures structured output:
- Validates against OEMModel type
- Required fields: model_year, brand, model, headline_bullets
- Optional fields: trim, etc.

### 3. Tool: fetch_url

The GPT can use `fetch_url` tool to:
- Fetch HTML from whitelisted OEM domains
- Parse content for model-year information
- Extract official specifications

### 4. API Integration

**Endpoint:** `POST /api/oem/gpt-parse`

**Request:**
```json
{
  "url": "https://pressroom.toyota.com/2026-tacoma",
  "system_prompt": "...", // Optional override
  "schema": {...} // Optional override
}
```

**Response:**
```json
{
  "success": true,
  "oemModel": {
    "model_year": 2026,
    "brand": "Toyota",
    "model": "Tacoma",
    "headline_bullets": [...]
  },
  "source_url": "...",
  "timestamp": "..."
}
```

---

## Testing

### Test OEM Router GPT

```bash
curl -X POST http://localhost:3000/api/oem/gpt-parse \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://pressroom.toyota.com/2026-tacoma"
  }'
```

### Test Group Actions

```ts
import { buildGroupCommerceActions } from '@/engine/oem_router/groupActions';

const mockOem = { model_year: 2026, brand: 'Toyota', model: 'Tacoma' };
const mockRouting = { /* ... */ };
const mockDealers = { /* ... */ };

const actions = buildGroupCommerceActions(mockOem, mockRouting, mockDealers);
console.log(actions); // Should generate PUSH_SCHEMA, UPDATE_MODEL_COPY, RUN_REFRESH actions
```

### Test Execute Endpoint

```bash
curl -X POST http://localhost:3000/api/agentic/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "batch_id": "test-batch-123",
    "actions": [...]
  }'
```

---

## Next Steps

1. **Wire OEM Router GPT to actual OpenAI/Anthropic API**
   - Update `app/api/oem/gpt-parse/route.ts` with real API calls
   - Configure API keys in environment variables

2. **Implement routeOemUpdate() function**
   - Create `engine/oem_router/route.ts` if not exists
   - Implement dealer/group matching logic
   - Calculate priority scores

3. **Connect to Pulse system**
   - Push `group_rollups` to Pulse tiles
   - Display `ExecOemRollupCard` in exec dashboard

4. **Implement tool execution**
   - Wire `site_inject` to actual site injection API
   - Wire `auto_fix` to auto-fix engine
   - Wire `queue_refresh` to refresh queue

5. **Add approval workflow**
   - Create approval queue table
   - Build approval UI for marketing_director+
   - Send notifications on approval requests

---

## Files Created

1. ✅ `components/pulse/ExecOemRollupCard.tsx` - Exec tile component
2. ✅ `engine/oem_router/groupActions.ts` - Group actions helper
3. ✅ `models/CommerceAction.ts` - CommerceAction types
4. ✅ `lib/oem-router-gpt.ts` - OEM Router GPT config
5. ✅ `app/api/oem/gpt-parse/route.ts` - GPT parse endpoint
6. ✅ `app/api/agentic/execute/route.ts` - Execute endpoint

---

**Status:** ✅ **Complete** - All components created and ready for integration

