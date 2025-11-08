# 🚀 Next Steps - DealershipAI Complete Integration

## ✅ What's Complete

1. **RBAC System** - Clerk-based role/tenant auth
2. **Site-Inject APIs** - Versions & rollback
3. **Fix Action Drawer** - Dry-run, diff, auto-verify
4. **CSV Editor** - Invalid row editing
5. **Bulk Upload Panel** - Complete upload flow
6. **Redis Idempotency** - Duplicate prevention
7. **E2E Tests** - Playwright tests ready

## 🔧 Immediate Fixes Needed

### 1. **Fix Route Conflict** (CRITICAL)
Build error: `/sign-in` route conflict
```bash
# Check for duplicate sign-in routes
find app -name "*sign-in*" -type f
# Remove one of the conflicting routes
```

### 2. **Update FixActionDrawer Import**
✅ Already fixed - FleetTable now uses `@/components/FixActionDrawer`

### 3. **Update Origins Route to RBAC**
✅ Already fixed - Now uses `requireRBAC`

## 📋 Remaining Tasks

### Priority 1: Clerk Setup
1. **Set User Roles in Clerk Dashboard**:
   - Go to Clerk Dashboard → Users
   - For each user, set `publicMetadata.role` = `'admin'`, `'ops'`, or `'viewer'`
   - Set `publicMetadata.tenant` = tenant ID

2. **Or use API to set roles**:
```typescript
// Run once to set up user roles
import { clerkClient } from '@clerk/nextjs/server'

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'admin',
    tenant: 'demo-dealer-001'
  }
})
```

### Priority 2: Component Integration
1. **Wire FixActionDrawer to Fleet Table**:
   - ✅ Already imported in FleetTable
   - ✅ Button already exists
   - ⚠️ Need to update to use new drawer with dry-run

2. **Update Bulk Upload Page**:
   - `/app/(dashboard)/bulk/page.tsx` exists
   - Add to navigation menu

### Priority 3: API Routes
1. **Update Remaining Routes to RBAC**:
   - `/api/origins/bulk-csv` - Still uses `requirePermission` (complex, may need to keep)
   - Check for any other routes using old auth

2. **Create `/api/probe/verify-bulk`** (if missing):
```typescript
import { requireRBAC, rbacHeaders } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  const rbac = await requireRBAC(req, ['admin','ops'])
  if (rbac instanceof NextResponse) return rbac
  
  const { origins } = await req.json()
  // Bulk verify logic
}
```

### Priority 4: UX Polish
1. **Status Chips in Fleet Rows**:
   - Add "Verified", "Needs Fix", "Probe Failed" badges
   - Color-code by last probe age

2. **Version Count in Evidence Cards**:
   - Show version count from `/api/site-inject/versions`
   - Display last rollback timestamp

3. **Export CSV**:
   - Add "Export CSV" button to Fleet table
   - Include: origin, tenant, verified, schemaCount, cwvScore, etc.

## 🧪 Testing Checklist

### Manual Testing:
- [ ] Sign in with Clerk
- [ ] Check user role is set correctly
- [ ] Access Fleet dashboard
- [ ] Click "Fix now" on an origin
- [ ] Test dry-run mode
- [ ] Test apply fix
- [ ] Test auto-verify
- [ ] Test rollback
- [ ] Upload CSV file
- [ ] Edit invalid rows
- [ ] Commit fixed rows

### E2E Testing:
```bash
pnpm install
pnpm dlx playwright install
pnpm test:e2e
```

## 🐛 Known Issues

1. **Route Conflict**: `/sign-in` has duplicate route definition
2. **Old FixActionDrawer**: There's an old version in `components/fleet/` that should be removed
3. **Bulk CSV Route**: Still uses `requirePermission` - may need to keep for compatibility

## 📝 Quick Wins

### 1. Add Navigation Link to Bulk Page
```tsx
// In dashboard layout or navigation
<Link href="/bulk">Bulk Upload</Link>
```

### 2. Add Status Badges
```tsx
// In FleetTable row
{row.evidence.verified ? (
  <span className="px-2 py-1 bg-green-700/40 text-green-200 rounded">Verified</span>
) : (
  <span className="px-2 py-1 bg-amber-700/40 text-amber-200 rounded">Needs Fix</span>
)}
```

### 3. Add Export CSV
```tsx
const exportCSV = () => {
  const csv = rows.map(r => `${r.origin},${r.tenant},${r.evidence.verified}`).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fleet-export.csv'
  a.click()
}
```

## 🎯 Deployment Checklist

- [ ] Fix route conflict
- [ ] Set Clerk user roles
- [ ] Test RBAC with different roles
- [ ] Run E2E tests
- [ ] Verify all API routes work
- [ ] Test bulk upload flow
- [ ] Test fix drawer with dry-run
- [ ] Test rollback functionality
- [ ] Deploy to Vercel

## 🚀 Ready to Deploy?

Once you:
1. ✅ Fix the route conflict
2. ✅ Set Clerk user roles
3. ✅ Test the flow

You're ready to deploy! All core functionality is in place.
