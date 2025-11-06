# Database Schema Verification Report
## Date: November 6, 2025

## ✅ Architecture Compliance Check

### Required Schema (from dAI_SYSTEM_ARCHITECTURE_11_6_25.md)
- `tenants` - Multi-tenant hierarchy
- `users` - User accounts with RBAC
- `onboarding_progress` - Onboarding state
- `dealership_data` - Analytics data (tenant-scoped)
- `score_history` - Historical scores
- `api_usage` - Usage tracking

### Required Features
- Row Level Security (RLS) policies
- Tenant isolation at database level
- Proper indexes for performance
- Foreign key relationships

---

## 🔍 Current Schema Analysis

### 1. Tenant Model ✅
**File**: `prisma/schema.prisma` (lines 299-323)

**Status**: ✅ Compliant

**Structure**:
```prisma
model Tenant {
  id           String   @id @default(cuid())
  name         String
  website      String?
  city         String?
  state        String?
  // ... other fields
  profiles     Profile[]
  connections  Connection[]
  competitors  Competitor[]
  // ... relations
}
```

**Compliance**:
- ✅ Has `id` (primary key)
- ✅ Has `name` (required)
- ✅ Has relations to tenant-scoped models
- ⚠️ **Missing**: `clerk_org_id` field for Clerk organization mapping
- ⚠️ **Missing**: `parent_id` for enterprise group hierarchy
- ⚠️ **Missing**: `type` field (enterprise, dealership, single)
- ⚠️ **Missing**: `subscription_tier` field

---

### 2. User Model ⚠️
**File**: `prisma/schema.prisma` (lines 94-117)

**Status**: ⚠️ Partially Compliant

**Current Structure**:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          String    @default("user")
  dealershipId  String?
  // ... relations
}
```

**Gaps**:
- ❌ **Missing**: `clerk_id` field (Clerk user ID)
- ❌ **Missing**: `tenant_id` field (direct tenant association)
- ❌ **Missing**: `permissions` JSONB field
- ⚠️ Has `dealershipId` but should have `tenant_id`
- ⚠️ Role is string, should be enum or relation

**Architecture Requirement**:
```prisma
model User {
  id            String    @id @default(cuid())
  clerk_id      String    @unique  // Clerk user ID
  tenant_id     String
  role          Role      // Enum or relation
  permissions   Json      // RBAC permissions
  // ...
}
```

---

### 3. Profile Model ✅
**File**: `prisma/schema.prisma` (lines 325-335)

**Status**: ✅ Compliant

**Structure**:
```prisma
model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  email     String
  role      String   @default("admin")
  tenantId  String
  tenant    Tenant   @relation(...)
}
```

**Compliance**:
- ✅ Has `tenantId` for tenant association
- ✅ Has relation to Tenant
- ✅ Has `userId` for user mapping
- ✅ Proper cascade delete

---

### 4. Onboarding Model ✅
**File**: `prisma/schema.prisma` (lines 349-359)

**Status**: ✅ Compliant

**Structure**:
```prisma
model OnboardingRun {
  id        String   @id @default(cuid())
  tenantId  String   @unique
  step      Int      @default(1)
  completed Boolean  @default(false)
  // ...
}
```

**Compliance**:
- ✅ Tenant-scoped
- ✅ Tracks progress
- ✅ Proper relations

**Note**: Also uses Supabase `onboarding_progress` table in some routes

---

### 5. Tenant-Scoped Models ✅
**Status**: ✅ Compliant

**Models with tenant_id**:
- ✅ `Profile` - Has `tenantId`
- ✅ `Connection` - Has `tenantId`
- ✅ `Competitor` - Has `tenantId`
- ✅ `Insight` - Has `tenantId`
- ✅ `Action` - Has `tenantId`
- ✅ `PulseMetric` - Has `tenantId`
- ✅ `Memory` - Has `tenantId`

**All properly scoped with relations and cascade deletes**

---

### 6. Row Level Security (RLS) ❌
**Status**: ❌ Not Implemented in Prisma Schema

**Issue**: 
- Prisma schema doesn't define RLS policies
- RLS must be implemented in PostgreSQL/Supabase
- No indication of RLS policies in schema

**Architecture Requirement**:
```sql
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON dealership_data
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

**Current State**: 
- RLS utilities exist in `lib/api-protection/tenant-isolation.ts`
- But no RLS policies defined in schema
- No migration files for RLS setup

---

### 7. Missing Tables ❌

**Architecture Requires**:
- `dealership_data` - Analytics data (tenant-scoped)
- `score_history` - Historical scores
- `api_usage` - Usage tracking

**Current State**:
- ❌ `dealership_data` - Not in schema
- ❌ `score_history` - Not in schema (has `Score` but different structure)
- ❌ `api_usage` - Not in schema

**Existing Similar Models**:
- `Score` - Has `dealershipId` but not `tenant_id`
- `Audit` - Has `dealershipId` but not `tenant_id`
- `Dealership` - Exists but not tenant-scoped

---

### 8. Database Provider ⚠️
**File**: `prisma/schema.prisma` (line 20-23)

**Current**:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**Architecture Requires**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Issue**: 
- ⚠️ Using SQLite for development (acceptable)
- ⚠️ Should use PostgreSQL for production
- ⚠️ Architecture specifies Supabase/PostgreSQL

---

## 📊 Compliance Score

| Category | Status | Score |
|----------|--------|-------|
| Tenant Model | ⚠️ | 70% |
| User Model | ❌ | 40% |
| Profile Model | ✅ | 100% |
| Onboarding Model | ✅ | 100% |
| Tenant-Scoped Models | ✅ | 100% |
| RLS Policies | ❌ | 0% |
| Required Tables | ❌ | 30% |
| Database Provider | ⚠️ | 50% |

**Overall Schema Compliance**: 61%

---

## 🔧 Required Fixes

### Critical (High Priority)

1. **Add Clerk Integration Fields**
   ```prisma
   model Tenant {
     clerk_org_id String? @unique  // Clerk organization ID
     // ...
   }
   
   model User {
     clerk_id String @unique  // Clerk user ID
     tenant_id String  // Direct tenant association
     // ...
   }
   ```

2. **Add Missing Tables**
   ```prisma
   model DealershipData {
     id            String   @id @default(cuid())
     tenant_id     String
     ai_visibility_score Int
     seo_score     Int
     aeo_score     Int
     geo_score     Int
     schema_audit  Json?
     cwv_metrics   Json?
     last_updated_at DateTime @default(now())
     
     tenant Tenant @relation(...)
   }
   
   model ScoreHistory {
     id            String   @id @default(cuid())
     tenant_id     String
     score_type    String
     score_value   Float
     recorded_at   DateTime @default(now())
     
     tenant Tenant @relation(...)
   }
   
   model ApiUsage {
     id            String   @id @default(cuid())
     tenant_id     String
     user_id       String
     endpoint      String
     method        String
     status_code   Int
     response_time Int
     created_at    DateTime @default(now())
     
     tenant Tenant @relation(...)
   }
   ```

3. **Update User Model**
   ```prisma
   model User {
     id            String    @id @default(cuid())
     clerk_id      String    @unique
     tenant_id     String
     email         String    @unique
     name          String?
     role          Role      @default(USER)
     permissions   Json      @default("[]")
     created_at    DateTime  @default(now())
     
     tenant Tenant @relation(...)
   }
   
   enum Role {
     SUPERADMIN
     ENTERPRISE_ADMIN
     DEALERSHIP_ADMIN
     USER
   }
   ```

4. **Add Enterprise Hierarchy**
   ```prisma
   model Tenant {
     id           String   @id @default(cuid())
     name         String
     type         TenantType
     parent_id    String?  // For enterprise groups
     parent       Tenant?  @relation("EnterpriseGroups", fields: [parent_id], references: [id])
     children     Tenant[] @relation("EnterpriseGroups")
     clerk_org_id String?  @unique
     subscription_tier String @default("test_drive")
     mrr          Decimal  @default(0)
     // ...
   }
   
   enum TenantType {
     ENTERPRISE
     DEALERSHIP
     SINGLE
   }
   ```

### High Priority

5. **Create RLS Migration**
   - Add RLS policies for all tenant-scoped tables
   - Create migration file
   - Document RLS setup

6. **Update Database Provider**
   - Switch to PostgreSQL for production
   - Update DATABASE_URL to use PostgreSQL
   - Keep SQLite for local development (optional)

### Medium Priority

7. **Add Indexes for Performance**
   ```prisma
   model Tenant {
     // ...
     @@index([clerk_org_id])
     @@index([parent_id])
   }
   
   model User {
     // ...
     @@index([clerk_id])
     @@index([tenant_id])
   }
   ```

8. **Add Audit Fields**
   ```prisma
   model Tenant {
     // ...
     created_at DateTime @default(now())
     updated_at DateTime @updatedAt
     created_by String?
     updated_by String?
   }
   ```

---

## ✅ What's Working Well

1. **Tenant Model Structure**: Good foundation
2. **Tenant-Scoped Relations**: Properly implemented
3. **Cascade Deletes**: Properly configured
4. **Profile Model**: Good user-tenant mapping
5. **Onboarding Model**: Properly scoped

---

## 📝 Migration Plan

### Phase 1: Add Clerk Fields
1. Add `clerk_org_id` to Tenant
2. Add `clerk_id` to User
3. Add `tenant_id` to User (if missing)
4. Create migration

### Phase 2: Add Missing Tables
1. Create `DealershipData` model
2. Create `ScoreHistory` model
3. Create `ApiUsage` model
4. Create migration

### Phase 3: Add Enterprise Hierarchy
1. Add `type` and `parent_id` to Tenant
2. Add `subscription_tier` and `mrr`
3. Create migration

### Phase 4: RLS Setup
1. Create RLS policies
2. Enable RLS on all tenant tables
3. Test tenant isolation

---

**Status**: ⚠️ Partially Compliant - Good foundation, but missing Clerk integration and RLS  
**Priority**: High - Required for production multi-tenant system  
**Last Updated**: November 6, 2025

