# 🚀 Quick Start: Fleet Management & Bulk Upload

This guide will get you up and running with the new fleet management system in **under 10 minutes**.

---

## ✅ Prerequisites

- Node.js 18+ installed
- Supabase CLI installed (`npm install -g supabase`)
- PostgreSQL running locally (via Supabase)
- Valid auth token (JWT with tenant_id, user_id, role)

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `papaparse` - CSV parsing
- `@types/papaparse` - TypeScript types
- All existing dependencies

---

## 🗄️ Step 2: Setup Database

### Option A: Local Supabase (Recommended for Dev)

```bash
# Start Supabase (if not already running)
npx supabase start

# Apply the fleet migration
npx supabase migration up

# Open Supabase Studio to verify tables
open http://localhost:54323
```

### Option B: Remote Supabase (Production)

```bash
# Link to your project
npx supabase link --project-ref your-project-ref

# Push migration
npx supabase db push
```

### Verify Tables Created

Navigate to Supabase Studio → Table Editor and confirm:
- ✅ `origins`
- ✅ `origin_uploads`
- ✅ `evidence_snapshots`
- ✅ `fleet_audit_log`
- ✅ `fleet_scheduled_jobs`

---

## 🔑 Step 3: Configure Environment

Create or update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Auth
JWT_SECRET=your_jwt_secret
```

Get keys from:
```bash
npx supabase status
```

---

## 🧪 Step 4: Test API Endpoints

### Create Test JWT Token

For development, generate a test token:

```bash
node scripts/generate-test-token.js
```

Or create manually:

```javascript
const jwt = require('jsonwebtoken')

const token = jwt.sign(
  {
    tenant_id: 'test-tenant-123',
    user_id: 'test-user-456',
    role: 'admin',
    permissions: ['origins:read', 'origins:bulk_upload']
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
)

console.log('Token:', token)
```

### Test CSV Upload (Preview)

Create `test.csv`:
```csv
origin,tenant,display_name,priority_level,tags,notes
https://example-dealer.com,test-tenant-123,Example Dealer,high,"auto,dealer",Test origin
dealer2.com,test-tenant-123,Dealer Two,medium,"car,sales",Another test
```

Test the endpoint:
```bash
curl -X POST http://localhost:3000/api/origins/bulk-csv \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@test.csv"
```

**Expected Response:**
```json
{
  "ok": true,
  "preview": [...],
  "counts": {
    "parsed": 2,
    "valid": 2,
    "invalid": 0,
    "duplicates": 0
  },
  "invalid": [],
  "uploadId": "abc123...",
  "fileChecksum": "sha256..."
}
```

### Test Commit

```bash
curl -X POST http://localhost:3000/api/origins/bulk-csv/commit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "uploadId": "abc123...",
    "fileChecksum": "sha256...",
    "fileName": "test.csv",
    "rows": [
      {
        "origin": "https://example-dealer.com",
        "tenant": "test-tenant-123",
        "display_name": "Example Dealer",
        "priority_level": "high",
        "tags": ["auto", "dealer"],
        "notes": "Test origin",
        "checksum": "checksum123"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "batchId": "uuid...",
  "results": {
    "inserted": 1,
    "updated": 0,
    "failed": 0,
    "errors": []
  }
}
```

---

## 🎨 Step 5: Integrate UI Component

### Add to Fleet Page

Edit `app/(dashboard)/fleet/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import BulkUploadDialog from '@/components/fleet/BulkUploadDialog'

export default function FleetPage() {
  const [showUpload, setShowUpload] = useState(false)
  const tenantId = 'your-tenant-id' // Get from auth context

  return (
    <div>
      {/* Existing fleet list */}
      <button
        onClick={() => setShowUpload(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Bulk Upload
      </button>

      {/* Bulk upload dialog */}
      <BulkUploadDialog
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={(batchId) => {
          console.log('Upload successful:', batchId)
          // Refresh fleet list
        }}
        tenantId={tenantId}
      />
    </div>
  )
}
```

### Start Dev Server

```bash
npm run dev
```

Navigate to http://localhost:3000/fleet and click "Bulk Upload".

---

## 🧪 Step 6: Run E2E Tests

```bash
# Install Playwright (if not already)
npx playwright install

# Run tests
npx playwright test bulk-upload.spec.ts

# Run with UI
npx playwright test bulk-upload.spec.ts --ui

# Generate report
npx playwright show-report
```

---

## 🔐 Step 7: Configure RBAC

### Update User Roles

In your auth provider (Clerk, Auth0, etc.), set user roles:

**Available Roles:**
- `owner` - Full access (100MB uploads, 10K batch, 100K daily)
- `admin` - Most access (100MB uploads, 10K batch, 50K daily)
- `manager` - Fleet management (50MB uploads, 5K batch, 10K daily)
- `editor` - Limited writes (10MB uploads, 1K batch, 5K daily)
- `analyst` - Read-only with exports (no uploads)
- `viewer` - Read-only (no uploads, no exports)

### Test Permission Enforcement

```bash
# Test with viewer role (should fail)
curl -X POST http://localhost:3000/api/origins/bulk-csv \
  -H "Authorization: Bearer VIEWER_TOKEN" \
  -F "file=@test.csv"

# Expected: 403 Forbidden
```

---

## 📊 Step 8: Monitor & Debug

### View Audit Logs

```sql
-- In Supabase SQL Editor
SELECT
  event_type,
  actor_role,
  event_data->>'rows_valid' as valid_rows,
  event_data->>'rows_invalid' as invalid_rows,
  success,
  duration_ms,
  created_at
FROM fleet_audit_log
WHERE tenant_id = 'your-tenant-id'
ORDER BY created_at DESC
LIMIT 20;
```

### View Upload History

```sql
SELECT
  file_name,
  status,
  rows_committed,
  rows_invalid,
  uploaded_by,
  created_at,
  completed_at
FROM origin_uploads
WHERE tenant_id = 'your-tenant-id'
ORDER BY created_at DESC;
```

### View Origins

```sql
SELECT
  origin,
  display_name,
  verification_status,
  priority_level,
  tags,
  created_at
FROM origins
WHERE tenant_id = 'your-tenant-id'
ORDER BY created_at DESC
LIMIT 50;
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" on upload
**Solution:**
- Check JWT token is included: `Authorization: Bearer <token>`
- Verify token contains `tenant_id`, `user_id`, `role`
- Check `JWT_SECRET` in `.env.local` matches signing key

### Issue: "Missing permission: origins:bulk_upload"
**Solution:**
- Check user role (must be `owner`, `admin`, `manager`, or `editor`)
- Verify role is correctly set in JWT token
- Review RBAC matrix in `lib/authz-unified.ts`

### Issue: CSV parsing fails
**Solution:**
- Ensure CSV is UTF-8 encoded
- Remove BOM (Byte Order Mark) if present
- Check column names match: `origin`, `tenant`, `display_name`, etc.
- Validate domain format (no spaces, no special chars)

### Issue: "Batch size exceeds limit"
**Solution:**
- Check user role upload limits (see RBAC section)
- Split CSV into smaller files
- Request role upgrade from admin

### Issue: RLS policies block queries
**Solution:**
- Verify user exists in `users` table with correct `clerk_id`
- Test `get_user_tenant_id()` function in SQL editor
- Check JWT token `sub` claim matches `users.clerk_id`

---

## 🎯 Next Steps

Now that you have the basics working:

1. **Customize CSV Format**
   - Add custom columns to `origins` table
   - Update CSV parser in `bulk-csv/route.ts`
   - Update UI component to show new fields

2. **Add Verification**
   - Implement `/api/origins/{id}/verify` endpoint
   - Connect to AI visibility testing APIs
   - Schedule auto-verification jobs

3. **Build Evidence Integration**
   - Capture evidence on upload
   - Show evidence cards in UI
   - Export evidence to S3/BigQuery

4. **Setup Monitoring**
   - Add Prometheus metrics
   - Configure Sentry error tracking
   - Set up alerts for failed uploads

5. **Enhance UI**
   - Add filtering/sorting to fleet list
   - Show upload history in sidebar
   - Add bulk verification button
   - Implement "verify all" action

---

## 📚 Additional Resources

- [Full Implementation Guide](FLEET_IMPLEMENTATION.md)
- [API Documentation](FLEET_IMPLEMENTATION.md#api-documentation)
- [RBAC Reference](lib/authz-unified.ts)
- [Database Schema](supabase/migrations/20250101000001_origins_and_fleet.sql)
- [E2E Tests](__tests__/e2e/bulk-upload.spec.ts)

---

## 🤝 Support

- **Issues:** Check troubleshooting section above
- **Questions:** Review code comments in source files
- **Bugs:** Open GitHub issue with reproduction steps

---

**You're all set! 🎉**

Time to start uploading fleets and managing origins like a pro.
