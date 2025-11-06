# Architecture Compliance Checklist
## Based on dAI_SYSTEM_ARCHITECTURE_11_6_25.md

Use this checklist to ensure all code follows the established architecture patterns.

---

## ✅ API Route Compliance

### Authentication
- [ ] Uses `auth()` from `@clerk/nextjs/server`
- [ ] Checks `userId` before processing
- [ ] Returns `401 Unauthorized` if not authenticated
- [ ] Handles unauthenticated requests gracefully

### Dynamic Export
- [ ] Has `export const dynamic = 'force-dynamic'` for API routes
- [ ] Prevents build-time evaluation

### Input Validation
- [ ] Uses Zod schemas for validation
- [ ] Validates all request inputs
- [ ] Returns `400 Bad Request` for invalid inputs
- [ ] Provides clear error messages

### Tenant Isolation
- [ ] Resolves tenant from Clerk org/user
- [ ] Filters database queries by `tenant_id`
- [ ] Never exposes data from other tenants
- [ ] Uses RLS policies where applicable

### Error Handling
- [ ] Wraps operations in try/catch
- [ ] Logs errors appropriately
- [ ] Returns proper HTTP status codes
- [ ] Provides user-friendly error messages
- [ ] Never exposes internal errors to client

### Response Format
- [ ] Uses consistent response structure
- [ ] Includes success/error indicators
- [ ] Returns appropriate status codes
- [ ] Uses NextResponse.json() consistently

### Type Safety
- [ ] Uses TypeScript types
- [ ] Validates types at runtime (Zod)
- [ ] No `any` types in production code

---

## ✅ Component Compliance

### Server vs Client Components
- [ ] Server components by default
- [ ] `'use client'` only when needed
- [ ] Data fetching in server components
- [ ] Interactive logic in client components

### Data Fetching
- [ ] Server-side data fetching preferred
- [ ] Uses SWR/React Query for client-side
- [ ] Proper loading states
- [ ] Error boundaries for failures

### Styling
- [ ] Uses Tailwind CSS utilities
- [ ] Consistent design tokens
- [ ] Responsive by default
- [ ] Cupertino aesthetic maintained

---

## ✅ Database Compliance

### Connection Management
- [ ] Uses Prisma client from `lib/db/pool.ts`
- [ ] Lazy initialization (allows builds without DB)
- [ ] Connection pooling configured
- [ ] Graceful error handling

### Tenant Isolation
- [ ] All queries filtered by tenant_id
- [ ] RLS policies enabled
- [ ] No cross-tenant data access
- [ ] Tenant context in all operations

### Query Patterns
- [ ] Uses Prisma for all queries
- [ ] Parameterized queries (no SQL injection)
- [ ] Proper error handling
- [ ] Transaction support where needed

---

## ✅ Security Compliance

### Authentication
- [ ] All protected routes require auth
- [ ] Middleware checks authentication
- [ ] Session management secure
- [ ] No sensitive data in client

### Authorization
- [ ] RBAC checks in place
- [ ] Feature gates implemented
- [ ] Permission checks before operations
- [ ] Audit logging for sensitive actions

### Input Security
- [ ] All inputs validated
- [ ] Sanitization where needed
- [ ] XSS prevention
- [ ] SQL injection prevention (Prisma)

### Data Protection
- [ ] Business logic server-side only
- [ ] No sensitive data in client
- [ ] Encrypted connections (HTTPS)
- [ ] Secure environment variables

---

## ✅ Performance Compliance

### Caching
- [ ] Appropriate cache headers
- [ ] Redis caching for expensive operations
- [ ] TTLs configured properly
- [ ] Cache invalidation strategy

### Optimization
- [ ] Code splitting (dynamic imports)
- [ ] Image optimization (Next.js Image)
- [ ] Lazy loading components
- [ ] Bundle size monitoring

### Database
- [ ] Connection pooling
- [ ] Query optimization
- [ ] Indexes on frequently queried fields
- [ ] Efficient data fetching

---

## ✅ Code Quality Compliance

### TypeScript
- [ ] No `any` types
- [ ] Proper type definitions
- [ ] Shared types in `/types`
- [ ] Type safety throughout

### Error Handling
- [ ] Try/catch in async functions
- [ ] Proper error logging
- [ ] User-friendly error messages
- [ ] Error boundaries for components

### Code Organization
- [ ] Server logic in `/lib`
- [ ] Components in `/components`
- [ ] Types in `/types`
- [ ] API routes in `/app/api`

### Naming Conventions
- [ ] Files: kebab-case
- [ ] Components: PascalCase
- [ ] Functions: camelCase
- [ ] Constants: UPPER_SNAKE_CASE

---

## ✅ Documentation Compliance

### Code Comments
- [ ] JSDoc comments for functions
- [ ] Explains complex logic
- [ ] Documents parameters/returns
- [ ] Notes any architecture decisions

### README/Docs
- [ ] API endpoints documented
- [ ] Architecture patterns explained
- [ ] Setup instructions clear
- [ ] Examples provided

---

## 🔍 Audit Process

1. **Select Route/Component**: Choose item to audit
2. **Run Checklist**: Go through each section
3. **Document Issues**: Note any non-compliance
4. **Fix Issues**: Update code to match patterns
5. **Verify**: Re-check after fixes
6. **Document**: Update architecture notes if needed

---

## 📊 Compliance Score

Track compliance across the codebase:
- **Total Routes**: ___
- **Compliant Routes**: ___
- **Non-Compliant Routes**: ___
- **Compliance Rate**: ___%

---

## 🚨 Common Non-Compliance Issues

1. **Missing `export const dynamic = 'force-dynamic'`**
2. **No input validation (Zod)**
3. **Missing authentication checks**
4. **No tenant isolation**
5. **Poor error handling**
6. **Business logic in client components**
7. **No type safety**
8. **Missing error logging**

---

**Last Updated**: November 6, 2025  
**Version**: 1.0

