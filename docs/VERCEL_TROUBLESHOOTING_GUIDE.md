# Vercel Deployment Troubleshooting Guide

## 🎯 Quick Diagnosis

### Step 1: Check Root Directory

**Most Common Issue**: Root Directory is set incorrectly in Vercel dashboard.

**Fix**:
1. Go to: https://vercel.com/[your-team]/[project]/settings
2. Find: "Build & Development Settings" → "Root Directory"
3. **For root-level Next.js apps**: Leave Root Directory **empty** (not set)
   - If it's currently set to `.` or `./`, clear it
   - Vercel will default to the repository root
4. **For monorepo apps**: Set to relative path like `apps/web` (no `./` prefix, no `../`)
5. Save

### Step 2: Run Verification Script

```bash
./scripts/verify-vercel-deployment.sh
```

This will check:
- Authentication status
- Project link
- Domain accessibility
- API endpoints
- Environment variables

## 🔍 Common Issues & Fixes

### Issue 1: Build Fails with "Module not found"

**Symptoms**:
```
Module not found: Can't resolve '@/components/...'
```

**Causes**:
- Root directory is wrong
- Path aliases not configured
- Missing dependencies

**Fixes**:
1. **Check root directory**: Must be `.` in Vercel dashboard
2. **Check `tsconfig.json`**: Verify path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```
3. **Check dependencies**: Run `npm install --legacy-peer-deps` locally

### Issue 2: Routes Return 404

**Symptoms**:
- `https://dash.dealershipai.com/dashboard` returns 404
- Routes work locally but not in production

**Causes**:
- Root directory wrong
- Routes not in correct location
- Middleware blocking routes

**Fixes**:
1. **Verify root directory**: Must be `.`
2. **Check route structure**: Routes should be in `app/` directory
3. **Check middleware**: Verify `middleware.ts` allows routes

### Issue 3: Build Timeout

**Symptoms**:
```
Build exceeded maximum execution time
```

**Causes**:
- Large dependencies
- Slow build process
- Resource limits

**Fixes**:
1. **Increase timeout**: Vercel dashboard → Settings → Build & Development Settings
2. **Optimize build**: Check for unnecessary dependencies
3. **Use build cache**: Enable in Vercel settings

### Issue 4: Environment Variables Missing

**Symptoms**:
```
Error: Environment variable not found
```

**Causes**:
- Variables not set in Vercel
- Wrong scope (production vs preview)
- Typo in variable name

**Fixes**:
1. **Add variables**: Vercel dashboard → Settings → Environment Variables
2. **Check scope**: Set for Production, Preview, and Development
3. **Verify names**: Match exactly (case-sensitive)

### Issue 5: Domain Not Working

**Symptoms**:
- `dash.dealershipai.com` doesn't load
- DNS errors

**Causes**:
- DNS not configured
- Domain not added to Vercel project
- SSL certificate issues

**Fixes**:
1. **Add domain**: Vercel dashboard → Settings → Domains
2. **Configure DNS**: Add CNAME record:
   - Host: `dash`
   - Value: `cname.vercel-dns.com`
3. **Wait for propagation**: DNS changes can take up to 48 hours

### Issue 6: Authentication Not Working

**Symptoms**:
- Clerk redirects fail
- Users can't sign in
- Session errors

**Causes**:
- Clerk keys not set
- Domain mismatch
- Cookie domain wrong

**Fixes**:
1. **Check Clerk keys**: Verify in Vercel environment variables
2. **Check domain**: Must match in Clerk dashboard
3. **Check cookie domain**: Should be `.dealershipai.com` for SSO

## 🛠️ Diagnostic Commands

### Check Vercel Configuration

```bash
./scripts/check-vercel-config.sh
```

### Verify Deployment

```bash
./scripts/verify-vercel-deployment.sh
```

### Check Build Locally

```bash
npm run build
```

### Test API Endpoints

```bash
# Health check
curl https://dash.dealershipai.com/api/health

# Pulse API
curl https://dash.dealershipai.com/api/pulse

# Market pulse
curl "https://dash.dealershipai.com/api/marketpulse/compute?dealer=example.com"
```

## 📋 Pre-Deployment Checklist

Before deploying, verify:

- [ ] Root directory is `.` in Vercel dashboard
- [ ] Build succeeds locally (`npm run build`)
- [ ] All routes exist in `app/` directory
- [ ] Components exist and imports are correct
- [ ] Environment variables are set in Vercel
- [ ] Domain is added to Vercel project
- [ ] DNS is configured correctly
- [ ] Clerk keys are set
- [ ] Database connection works

## 🔄 Deployment Workflow

1. **Fix root directory** (if needed)
2. **Run verification script**: `./scripts/verify-vercel-deployment.sh`
3. **Trigger deployment**: `git push origin main`
4. **Monitor build**: Check Vercel dashboard
5. **Verify deployment**: Test domain and routes
6. **Check logs**: Review build and runtime logs

## 📞 Getting Help

### Check Vercel Dashboard

- **Deployments**: https://vercel.com/[your-team]/[project]/deployments
- **Settings**: https://vercel.com/[your-team]/[project]/settings
- **Logs**: Click on deployment → "View Build Logs"

### Check Build Logs

1. Go to deployments page
2. Click latest deployment
3. Click "View Build Logs"
4. Look for errors or warnings

### Check Runtime Logs

1. Go to deployments page
2. Click latest deployment
3. Click "View Function Logs"
4. Check for runtime errors

## 🎯 Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Build fails | Check root directory = `.` |
| Routes 404 | Verify routes in `app/` directory |
| Module not found | Check path aliases in `tsconfig.json` |
| Env vars missing | Add in Vercel dashboard |
| Domain not working | Check DNS and domain settings |
| Auth not working | Verify Clerk keys and domain |

---

**Remember**: 90% of deployment issues are caused by incorrect root directory setting. Always check that first!

