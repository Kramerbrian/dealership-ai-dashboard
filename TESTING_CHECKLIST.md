# 🧪 Testing Checklist - DealershipAI

## ✅ Complete Flow Test

### 1. Authentication Flow
- [ ] Visit landing page (`/`)
- [ ] Click "Get Your Free Report"
- [ ] Sign up with Clerk (email/password or OAuth)
- [ ] Verify redirect to `/onboarding`
- [ ] Complete onboarding steps
- [ ] Verify redirect to `/dashboard`

### 2. Dashboard Access
- [ ] Dashboard loads without errors
- [ ] QAI card is visible and clickable
- [ ] Click QAI card → Modal opens
- [ ] Click "Open E-E-A-T" → Drawer opens
- [ ] Verify all metrics display correctly

### 3. Fleet Dashboard
- [ ] Navigate to `/fleet`
- [ ] Verify origins table displays
- [ ] Check evidence cards show data
- [ ] Verify toggle works
- [ ] Click "Fix now" on an origin

### 4. Fix Action Drawer
- [ ] Drawer opens when clicking "Fix now"
- [ ] Baseline JSON-LD loads from versions API
- [ ] Dry-run checkbox is checked by default
- [ ] Edit JSON-LD snippet
- [ ] Click "Check diff" → Verify diff preview shows
- [ ] Uncheck dry-run
- [ ] Check "Auto-verify after apply"
- [ ] Click "Apply fix" → Verify success
- [ ] Check rollback panel shows versions
- [ ] Click "Rollback" on a version → Verify success

### 5. Bulk CSV Upload
- [ ] Navigate to `/bulk` or `/fleet/uploads`
- [ ] Upload a CSV file with origins
- [ ] Verify preview shows parsed rows
- [ ] Check invalid rows are highlighted
- [ ] Edit invalid rows in editor
- [ ] Click "Commit fixed rows"
- [ ] Verify success message

### 6. RBAC Testing
- [ ] Test as `admin` role → All features accessible
- [ ] Test as `ops` role → Fix features accessible
- [ ] Test as `viewer` role → Read-only access
- [ ] Verify forbidden errors for unauthorized actions

## 🐛 Common Issues to Check

### Clerk Authentication
- [ ] User metadata has `role` and `tenant` set
- [ ] Redirects work correctly
- [ ] Session persists after page refresh

### API Routes
- [ ] All routes return data (or demo data)
- [ ] RBAC blocks unauthorized access
- [ ] Error handling works gracefully

### Components
- [ ] Modals/drawers open and close
- [ ] Loading states display
- [ ] Error states display
- [ ] Forms submit correctly

## 📝 Quick Test Commands

```bash
# Start dev server
npm run dev

# Run E2E tests
pnpm dlx playwright install
pnpm test:e2e

# Check environment variables
npx tsx scripts/verify-setup.ts

# Set user role (if needed)
npx tsx scripts/set-clerk-user-role.ts <userId> admin demo-dealer-001
```

## ✅ Success Criteria

- [ ] All pages load without errors
- [ ] Authentication flow works end-to-end
- [ ] Fix drawer with dry-run works
- [ ] Bulk upload with editing works
- [ ] RBAC enforces correct permissions
- [ ] All API routes respond correctly

## 🚀 Ready for Production When

- ✅ All tests pass
- ✅ No console errors
- ✅ RBAC working correctly
- ✅ Clerk user roles set
- ✅ Environment variables configured
