# Troubleshooting Guide

## Common Issues & Solutions

### API Endpoint Errors

#### `/api/agentic/execute` Returns 500

**Symptoms:**
- Endpoint returns HTTP 500
- Error message: "This module cannot be imported from a Client Component module"

**Causes:**
1. Clerk auth() called in wrong context
2. RBAC imports not properly isolated
3. Server/client component boundary violation

**Solutions:**
1. Ensure `export const runtime = 'nodejs'` is set
2. Verify all Clerk imports use `@clerk/nextjs/server`
3. Check that `requireRBAC` is only called in API routes
4. Ensure no 'use client' directives in server-side code

**Verification:**
```bash
curl -X POST https://dash.dealershipai.com/api/agentic/execute \
  -H "Content-Type: application/json" \
  -d '{"batch_id":"test","actions":[]}'
```

Expected responses:
- 401: Unauthorized (no auth) ✅
- 403: Forbidden (insufficient role) ✅
- 400: Bad Request (invalid payload) ✅
- 500: Server Error ❌ (indicates bug)

---

#### `/api/oem/gpt-parse` Returns 400

**Symptoms:**
- Endpoint returns HTTP 400
- Error: "URL is required"

**Cause:**
- Missing or invalid request payload

**Solution:**
```bash
curl -X POST https://dash.dealershipai.com/api/oem/gpt-parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://pressroom.toyota.com/2026-tacoma"}'
```

---

#### Domain Returns 308 Redirect

**Symptoms:**
- `dash.dealershipai.com` returns HTTP 308
- Redirects to another URL

**Causes:**
1. HTTPS redirect (expected)
2. Domain not properly configured in Vercel
3. DNS not pointing to Vercel

**Solutions:**
1. Check Vercel domain settings
2. Verify DNS records
3. Check if redirect is intentional (HTTPS enforcement)

---

### Build Errors

#### "Module not found" Errors

**Symptoms:**
- Build fails with module resolution errors
- Path aliases not working

**Solutions:**
1. Verify `tsconfig.json` path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```
2. Check Root Directory in Vercel dashboard (should be empty)
3. Verify `package.json` dependencies are installed

---

#### "Cannot find module '@/lib/...'"

**Symptoms:**
- Import errors for `@/` paths
- Works locally but fails in Vercel

**Solutions:**
1. Ensure Root Directory is empty in Vercel
2. Check `tsconfig.json` paths configuration
3. Verify file exists at expected location
4. Check for case sensitivity issues

---

### Authentication Issues

#### Clerk Auth Not Working

**Symptoms:**
- 401 errors on protected routes
- Auth state not persisting

**Solutions:**
1. Verify environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
2. Check Clerk dashboard for domain configuration
3. Verify middleware is properly configured
4. Check CSP headers allow Clerk domains

---

### Database Connection Issues

#### "Database connection failed"

**Symptoms:**
- API endpoints return 500
- Database queries fail

**Solutions:**
1. Verify `DATABASE_URL` is set in Vercel
2. Check database connection pooling settings
3. Verify Supabase connection string format
4. Check database firewall rules

---

### Cron Job Issues

#### Cron Jobs Not Running

**Symptoms:**
- Scheduled tasks not executing
- No logs in Vercel

**Solutions:**
1. Verify cron jobs in `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/daily-scoring",
         "schedule": "0 4 * * *"
       }
     ]
   }
   ```
2. Check Vercel dashboard → Settings → Cron Jobs
3. Verify endpoint returns 200 OK
4. Check endpoint logs for errors

---

## Diagnostic Commands

### Check API Endpoints
```bash
# Health check
curl https://dash.dealershipai.com/api/health

# Test POST endpoints
curl -X POST https://dash.dealershipai.com/api/oem/gpt-parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://pressroom.toyota.com/test"}'
```

### Check Vercel Configuration
```bash
npm run vercel:check
npm run vercel:verify
```

### Check Local Build
```bash
npm run build
npm run type-check
```

### Check Environment Variables
```bash
npm run verify:env
```

---

## Getting Help

1. Check Vercel deployment logs
2. Review API endpoint logs
3. Check browser console for client-side errors
4. Review server logs in Vercel dashboard
5. Test endpoints with curl commands above

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| 500 Error | Check server logs, verify imports |
| 401 Error | Check auth configuration |
| 403 Error | Check RBAC role assignments |
| 404 Error | Verify route exists |
| Build fails | Check Root Directory, verify dependencies |
| Module not found | Check path aliases, verify file exists |

