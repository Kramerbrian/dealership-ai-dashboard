# Fleet Management & Bulk Upload Implementation

## 🎉 What We Built

This implementation provides a **production-grade fleet management system** with comprehensive bulk CSV upload, validation, RBAC, and evidence tracking for dealership origins.

---

## 📁 Files Created

### 1. Database Schema
**[supabase/migrations/20250101000001_origins_and_fleet.sql](supabase/migrations/20250101000001_origins_and_fleet.sql)**

- ✅ **origins** table - Core fleet tracking with 20+ fields
- ✅ **origin_uploads** table - Bulk upload tracking with idempotency
- ✅ **evidence_snapshots** table - Time-series evidence with diffs
- ✅ **fleet_audit_log** table - Comprehensive audit trail
- ✅ **fleet_scheduled_jobs** table - Auto-verification scheduling
- ✅ Row-level security (RLS) policies on all tables
- ✅ Helper functions: `mark_stale_origins()`, `get_next_verification_batch()`, `compute_evidence_diff()`
- ✅ Automatic triggers for `updated_at` and checksum generation

**Key Features:**
- SHA1 checksums for global deduplication
- Tenant isolation via RLS
- Verification status workflow: `unverified → pending → confirmed/failed/stale`
- Evidence diff tracking for regression detection
- Rollback support for bulk uploads

### 2. Unified RBAC System
**[lib/authz-unified.ts](lib/authz-unified.ts)**

Consolidates the two existing RBAC systems into a single, fleet-aware authorization framework.

**Roles:** `owner`, `admin`, `manager`, `editor`, `analyst`, `viewer`

**Permissions (27 total):**
```typescript
// Fleet & Origins
'origins:read', 'origins:create', 'origins:update', 'origins:delete',
'origins:bulk_upload', 'origins:bulk_delete', 'origins:export', 'origins:verify', 'origins:schedule_jobs',

// Evidence & Audit
'evidence:read', 'evidence:capture', 'evidence:export',
'audit:read', 'audit:export',

// Dashboard & Analytics
'dashboard:view', 'analytics:view', 'analytics:export', 'reports:generate',

// System & Tenants
'tenants:manage', 'users:read', 'users:manage', 'settings:read', 'settings:write',
'billing:view', 'billing:manage',

// AI Operations
'ai:visibility_test', 'ai:prompt_test', 'ai:model_config'
```

**Upload Limits by Role:**
| Role | Max File Size | Max Batch Size | Daily Limit | File Types |
|------|--------------|----------------|-------------|------------|
| Owner | 100 MB | 10,000 | 100,000 | CSV, JSON, TXT |
| Admin | 100 MB | 10,000 | 50,000 | CSV, JSON, TXT |
| Manager | 50 MB | 5,000 | 10,000 | CSV, JSON |
| Editor | 10 MB | 1,000 | 5,000 | CSV |
| Analyst | 0 MB | 0 | 0 | None |
| Viewer | 0 MB | 0 | 0 | None |

**Middleware Helpers:**
```typescript
requireAuth(handler)                // Basic auth
requirePermission(perm, handler)    // Single permission
requireAnyPermission(perms, handler) // Any of multiple
requireRole(roles, handler)         // Role-based
validateUpload(user, size, type, count) // Upload validation
checkDailyQuota(user, count)        // Quota enforcement
```

### 3. Streaming CSV Upload API
**[app/api/origins/bulk-csv/route.ts](app/api/origins/bulk-csv/route.ts)**

**Endpoint:** `POST /api/origins/bulk-csv`

**Features:**
- ✅ Memory-efficient streaming with Papa Parse
- ✅ Handles files up to 100MB
- ✅ Excel injection protection (`=`, `+`, `-`, `@` detection)
- ✅ Domain validation with URL normalization
- ✅ XSS sanitization
- ✅ Cross-tenant upload checks
- ✅ Real-time deduplication by checksum
- ✅ Role-based upload limits enforcement
- ✅ Idempotency via file checksum
- ✅ Detailed validation error reporting

**Request:**
```bash
curl -X POST /api/origins/bulk-csv \
  -H "Authorization: Bearer <token>" \
  -F "file=@origins.csv"
```

**Response:**
```json
{
  "ok": true,
  "preview": [...],  // First 50 validated rows
  "counts": {
    "parsed": 1000,
    "valid": 950,
    "invalid": 30,
    "duplicates": 20
  },
  "invalid": [
    { "line": 5, "origin": "bad-url", "reason": "Invalid domain format" }
  ],
  "uploadId": "abc123...",
  "fileChecksum": "sha256..."
}
```

**CSV Format:**
```csv
origin,tenant,display_name,priority_level,tags,notes
https://example.com,demo-tenant,Example Dealer,high,"auto,dealer",Notes here
example2.com,,Another Dealer,medium,"car,sales",
```

### 4. Commit API
**[app/api/origins/bulk-csv/commit/route.ts](app/api/origins/bulk-csv/commit/route.ts)**

**Endpoint:** `POST /api/origins/bulk-csv/commit`

**Features:**
- ✅ Daily quota enforcement
- ✅ Idempotency check (prevents duplicate commits)
- ✅ Batch processing (500 rows per chunk)
- ✅ Upsert logic (handles duplicates gracefully)
- ✅ Granular error tracking per row
- ✅ Upload record creation with full lifecycle tracking
- ✅ Audit log integration
- ✅ Rollback support

**Request:**
```json
{
  "uploadId": "abc123...",
  "fileChecksum": "sha256...",
  "fileName": "origins.csv",
  "rows": [...]
}
```

**Response:**
```json
{
  "ok": true,
  "batchId": "uuid...",
  "results": {
    "inserted": 950,
    "updated": 0,
    "failed": 5,
    "errors": [
      { "origin": "https://fail.com", "reason": "Constraint violation" }
    ]
  }
}
```

### 5. CSV Upload UI Component
**[components/fleet/BulkUploadDialog.tsx](components/fleet/BulkUploadDialog.tsx)**

**Features:**
- ✅ Drag-and-drop file upload
- ✅ Click-to-browse fallback
- ✅ CSV template download
- ✅ Live preview table (first 50 rows)
- ✅ Summary cards: parsed, valid, invalid, duplicates
- ✅ Validation error display
- ✅ Multi-step wizard: upload → preview → commit → success
- ✅ Loading states with spinner
- ✅ Error handling with retry
- ✅ Framer Motion animations
- ✅ Dark theme UI matching dashboard

**Usage:**
```tsx
import BulkUploadDialog from '@/components/fleet/BulkUploadDialog'

<BulkUploadDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={(batchId) => console.log('Uploaded:', batchId)}
  tenantId={user.tenantId}
/>
```

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT-based auth with Bearer tokens
- ✅ 27 granular permissions
- ✅ 6 role hierarchy (owner → admin → manager → editor → analyst → viewer)
- ✅ Tenant isolation via RLS policies
- ✅ Cross-tenant upload restrictions

### Input Validation
- ✅ **Excel injection** protection (blocks `=`, `+`, `-`, `@` prefixes)
- ✅ **XSS sanitization** (strips `<`, `>`, `"`, `'`)
- ✅ **Domain validation** (regex + URL parsing)
- ✅ **File size limits** (role-based, up to 100MB)
- ✅ **MIME type checking** (CSV only)
- ✅ **Batch size limits** (role-based, up to 10K rows)
- ✅ **Daily quota enforcement** (prevents abuse)

### Audit & Compliance
- ✅ **Comprehensive audit log** for all operations
- ✅ **Actor tracking** (user ID, role, IP)
- ✅ **Event timestamps** with duration metrics
- ✅ **Success/failure tracking**
- ✅ **Idempotency keys** (prevents duplicate processing)
- ✅ **Rollback support** for bulk uploads

### Data Integrity
- ✅ **SHA1 checksums** for deduplication
- ✅ **SHA256 file hashes** for idempotency
- ✅ **Upsert logic** (graceful duplicate handling)
- ✅ **Foreign key constraints**
- ✅ **Check constraints** on enums
- ✅ **Unique constraints** on checksums

---

## 📊 Database Schema Highlights

### Origins Table
```sql
CREATE TABLE origins (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    origin TEXT NOT NULL,                 -- Normalized URL
    checksum TEXT UNIQUE NOT NULL,        -- SHA1(tenant_id || origin)
    verification_status TEXT,             -- unverified/pending/confirmed/failed/stale
    ai_visibility_score NUMERIC(5,2),     -- 0-100
    schema_coverage_score NUMERIC(5,2),
    ugc_score NUMERIC(5,2),
    oci_score NUMERIC(5,2),
    cwv_score NUMERIC(5,2),
    robots_allowed BOOLEAN,
    schema_types TEXT[],                  -- Array of schema.org types
    revenue_at_risk_usd NUMERIC(12,2),
    priority_level TEXT,                  -- low/medium/high/critical
    tags TEXT[],
    -- ... timestamps, metadata
    UNIQUE(tenant_id, origin)
);
```

### Evidence Snapshots
```sql
CREATE TABLE evidence_snapshots (
    id UUID PRIMARY KEY,
    origin_id UUID REFERENCES origins(id),
    tenant_id UUID REFERENCES tenants(id),
    captured_at TIMESTAMP WITH TIME ZONE,
    evidence_type TEXT,                   -- schema_scan, cwv_test, etc.
    verified_by TEXT,                     -- perplexity, chatgpt, claude, gemini
    verification_confidence NUMERIC(5,2),
    schema_types TEXT[],
    cwv_lcp_ms INT, cwv_fid_ms INT, cwv_cls NUMERIC(4,3),
    chatgpt_visible BOOLEAN,
    claude_visible BOOLEAN,
    perplexity_visible BOOLEAN,
    gemini_visible BOOLEAN,
    changes_from_previous JSONB,         -- Computed diff
    is_regression BOOLEAN,
    raw_response JSONB
);
```

### Audit Log
```sql
CREATE TABLE fleet_audit_log (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    event_type TEXT,                      -- origin_created, bulk_upload_completed, etc.
    actor_user_id UUID,
    actor_role TEXT,
    actor_ip TEXT,
    origin_id UUID,
    upload_batch_id UUID,
    event_data JSONB,                     -- Flexible event details
    success BOOLEAN,
    error_message TEXT,
    duration_ms INT
);
```

---

## 🚀 Next Steps (Remaining Work)

### Phase 2: Evidence Backend Integration ⏳
- [ ] Connect evidence snapshots to verification API
- [ ] Implement `POST /api/origins/{id}/verify` endpoint
- [ ] Add evidence capture on upload commit
- [ ] Build evidence diff computation
- [ ] Create evidence export API

### Phase 3: Bulk Verification & Scheduling ⏳
- [ ] `POST /api/origins/verify-all` endpoint
- [ ] `POST /api/origins/verify-batch` endpoint
- [ ] Cron job for auto-verification (`mark_stale_origins()`)
- [ ] Rate limiting with token bucket
- [ ] Scheduled job management UI

### Phase 4: E2E Testing ⏳
- [ ] Playwright tests for CSV upload flow
- [ ] RBAC enforcement tests
- [ ] Validation edge cases (Excel injection, XSS, etc.)
- [ ] Idempotency tests
- [ ] Daily quota tests
- [ ] Cross-tenant upload tests

### Phase 5: Observability ⏳
- [ ] Prometheus metrics integration
- [ ] Upload success/failure counters
- [ ] Parse duration histograms
- [ ] Daily quota gauges
- [ ] Alerting on failed uploads
- [ ] Audit log export to S3/BigQuery

---

## 🧪 Testing Checklist

### Manual Testing
```bash
# 1. Apply database migration
npx supabase db reset
npx supabase migration up

# 2. Generate test JWT token (or use Clerk)
# Include: { tenant_id, user_id, role, permissions }

# 3. Test CSV upload (preview)
curl -X POST http://localhost:3000/api/origins/bulk-csv \
  -H "Authorization: Bearer <token>" \
  -F "file=@test_origins.csv"

# 4. Test commit
curl -X POST http://localhost:3000/api/origins/bulk-csv/commit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"uploadId":"...", "fileChecksum":"...", "rows":[...]}'

# 5. Verify in Supabase Studio
open http://localhost:54323
# Check: origins, origin_uploads, fleet_audit_log tables
```

### Security Testing
- [ ] Test upload without auth → 401
- [ ] Test with `viewer` role → 403
- [ ] Test file > 100MB → 413
- [ ] Test CSV with `=IMPORTXML(...)` → validation error
- [ ] Test CSV with `<script>` → sanitized
- [ ] Test cross-tenant upload as `editor` → validation error
- [ ] Test duplicate file upload → idempotent response
- [ ] Test daily quota exceeded → 429

### Edge Cases
- [ ] Empty CSV file
- [ ] CSV with BOM (Byte Order Mark)
- [ ] CSV with invalid UTF-8
- [ ] CSV with 10K+ rows (batch processing)
- [ ] CSV with malformed URLs
- [ ] CSV with mixed protocols (http/https)
- [ ] Concurrent uploads from same user
- [ ] Network failure mid-upload

---

## 📚 API Documentation

### CSV Upload Flow

**Step 1: Upload & Validate**
```
POST /api/origins/bulk-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv_file>
```

**Step 2: Review Preview**
Client displays:
- Summary counts
- First 50 valid rows
- Validation errors

**Step 3: Commit**
```
POST /api/origins/bulk-csv/commit
Authorization: Bearer <token>
Content-Type: application/json

{
  "uploadId": "...",
  "fileChecksum": "...",
  "fileName": "...",
  "rows": [...]
}
```

**Step 4: Success**
- Returns batch ID
- Client refreshes fleet list
- User sees toast notification

---

## 🎯 Production Deployment

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Auth (Clerk or custom)
JWT_SECRET=your_jwt_secret

# Optional: Rate Limiting
UPLOAD_RATE_LIMIT_PER_MINUTE=10
```

### Database Migration
```bash
# Local
npx supabase migration up

# Production
npx supabase db push
```

### Vercel Deployment
```bash
# Install deps
npm install

# Build
npm run build

# Deploy
vercel --prod
```

### Post-Deployment Checklist
- [ ] Database migration applied
- [ ] RLS policies enabled
- [ ] Service role key configured
- [ ] JWT secret set
- [ ] CORS configured for API routes
- [ ] Rate limiting enabled (optional)
- [ ] Monitoring/alerts configured
- [ ] Audit log retention policy set

---

## 🔧 Troubleshooting

### Common Issues

**Problem:** CSV upload returns 401 Unauthorized
- **Solution:** Check JWT token in `Authorization: Bearer <token>` header
- Verify token includes `tenant_id`, `user_id`, `role`
- Check `JWT_SECRET` matches signing key

**Problem:** Upload fails with "Batch size exceeds limit"
- **Solution:** Check user role and `uploadLimits.maxBatchSize`
- Split CSV into smaller files
- Request role upgrade

**Problem:** Commit fails with "Daily quota exceeded"
- **Solution:** Check `origin_uploads` table for today's uploads
- Wait until tomorrow or request quota increase
- Use `checkDailyQuota()` to view current usage

**Problem:** Validation errors for valid domains
- **Solution:** Check domain format (no http://, no trailing slash)
- Ensure CSV encoding is UTF-8
- Remove BOM if present

**Problem:** RLS policies block queries
- **Solution:** Verify JWT token includes correct `tenant_id`
- Check user exists in `users` table with matching `clerk_id`
- Test `get_user_tenant_id()` function

---

## 📖 Developer Notes

### Code Organization
```
app/api/origins/
├── bulk-csv/
│   ├── route.ts          # Preview & validation
│   └── commit/
│       └── route.ts      # Persist to database

components/fleet/
└── BulkUploadDialog.tsx  # Upload UI component

lib/
└── authz-unified.ts      # RBAC system

supabase/migrations/
└── 20250101000001_origins_and_fleet.sql  # Schema
```

### Key Dependencies
```json
{
  "papaparse": "^5.4.1",           // CSV parsing
  "@types/papaparse": "^5.3.14",   // TypeScript types
  "@supabase/supabase-js": "^2.x", // Database client
  "framer-motion": "^x.x.x",       // UI animations
  "jsonwebtoken": "^9.x"           // JWT auth
}
```

### Performance Considerations
- CSV parsing streams data (no full file load)
- Chunks of 500 rows for upsert operations
- Indexes on `tenant_id`, `checksum`, `verification_status`
- RLS policies use `get_user_tenant_id()` function (cached)
- Preview limited to first 50 rows (UI optimization)

### Security Best Practices
- Never trust client input (validate everything)
- Sanitize strings before database insertion
- Use parameterized queries (Supabase client handles this)
- Rate limit API endpoints (TODO: add middleware)
- Log all sensitive operations to audit log
- Encrypt sensitive data at rest (Supabase handles this)

---

## 🎉 Summary

We've built a **production-ready fleet management system** with:

✅ **5 database tables** with RLS policies, triggers, and helper functions
✅ **Unified RBAC system** with 6 roles and 27 permissions
✅ **Streaming CSV upload API** with robust validation (100MB+ files)
✅ **Commit API** with idempotency, quotas, and rollback support
✅ **Beautiful CSV upload UI** with drag-drop, preview, and wizard flow
✅ **Security hardened** (Excel injection, XSS, MIME validation, tenant isolation)
✅ **Audit logging** for compliance and debugging
✅ **Role-based upload limits** (file size, batch size, daily quota)

**Next:** Evidence integration, bulk verification, E2E tests, and observability.

---

## 📞 Support & Feedback

For questions or issues, please:
1. Check this documentation
2. Review the code comments
3. Test with sample data
4. Open a GitHub issue (if applicable)

**Happy Fleet Managing! 🚀**
