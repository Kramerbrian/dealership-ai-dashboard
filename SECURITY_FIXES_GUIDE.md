# Security Vulnerabilities Fix Guide

## Current Status

**NPM Audit:** ✅ No vulnerabilities found locally
**GitHub Dependabot:** ⚠️ 10 vulnerabilities detected (1 critical, 4 high, 5 moderate)

## Understanding the Discrepancy

GitHub Dependabot often detects vulnerabilities that npm audit doesn't because:
1. Dependabot scans the entire dependency tree more deeply
2. It includes GitHub Actions and CI/CD dependencies
3. It checks against a broader vulnerability database
4. It may flag transitive dependencies that npm audit skips

## Reviewing Dependabot Alerts

Visit: https://github.com/Kramerbrian/dealership-ai-dashboard/security/dependabot

### Steps to Review:

1. **Access Dependabot Alerts:**
   - Go to your GitHub repository
   - Click "Security" tab
   - Click "Dependabot alerts"

2. **Prioritize by Severity:**
   - **Critical (1):** Fix immediately
   - **High (4):** Fix within 24-48 hours
   - **Moderate (5):** Fix within 1 week

3. **Review Each Alert:**
   - Click on each alert to see details
   - Check if it affects runtime code or just dev dependencies
   - Read the CVE description and potential impact

## Common Vulnerability Types

### 1. Next.js / React Vulnerabilities
**If you see alerts about Next.js or React:**
```bash
npm update next react react-dom
npm audit fix
```

### 2. Sentry SDK Vulnerabilities
**If alerts are about @sentry packages:**
```bash
npm update @sentry/nextjs
npm audit fix
```

### 3. Prisma Vulnerabilities
**If alerts are about Prisma:**
```bash
npm update @prisma/client prisma
npm audit fix
```

### 4. Development Dependencies
**Low-risk dev-only vulnerabilities:**
```bash
npm audit fix --only=dev
```

## Automated Fix Process

### Step 1: Run Automated Fixes
```bash
cd /Users/briankramer/dealership-ai-dashboard

# Try automatic fixes
npm audit fix

# If that doesn't work, try force fixes (use with caution)
npm audit fix --force
```

### Step 2: Update Specific Packages
```bash
# Update all packages to latest patch versions
npm update

# Update specific package to latest version
npm update package-name@latest
```

### Step 3: Check for Breaking Changes
```bash
# Run tests
npm test

# Run type checking
npm run type-check

# Try a build
npm run build
```

### Step 4: Commit and Deploy
```bash
git add package.json package-lock.json
git commit -m "fix: update dependencies to address security vulnerabilities"
git push origin main
```

## Manual Fix Process

If automated fixes don't work, you may need to manually update packages:

### 1. Identify the Vulnerable Package
From Dependabot alerts, note:
- Package name
- Current version
- Fixed version
- Whether it's direct or transitive

### 2. Update Direct Dependencies
```bash
# Install specific version
npm install package-name@^fixed.version.number
```

### 3. Handle Transitive Dependencies
If a vulnerability is in a transitive dependency (dependency of a dependency):

**Option A: Use npm overrides (package.json)**
```json
{
  "overrides": {
    "vulnerable-package": "^safe.version.number"
  }
}
```

**Option B: Wait for parent package update**
- Check if the parent package has an update that includes the fix
- Update the parent package instead

## Specific Package Update Commands

Based on common vulnerabilities:

```bash
# Update Next.js
npm update next@latest

# Update Sentry
npm update @sentry/nextjs@latest

# Update Clerk
npm update @clerk/nextjs@latest

# Update Prisma
npm update @prisma/client@latest prisma@latest

# Update Stripe
npm update stripe@latest @stripe/stripe-js@latest

# Update Supabase
npm update @supabase/supabase-js@latest

# Update all React packages
npm update react@latest react-dom@latest

# Update Vercel packages
npm update @vercel/analytics@latest @vercel/kv@latest @vercel/postgres@latest
```

## GitHub Actions Dependencies

If vulnerabilities are in GitHub Actions:

1. Go to `.github/workflows/` directory
2. Update action versions in workflow files:
   ```yaml
   # Update from v2 to v3 (example)
   - uses: actions/checkout@v2
   # to
   - uses: actions/checkout@v3
   ```

## Testing After Updates

### 1. Local Testing
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test

# Type check
npm run type-check

# Build
npm run build

# Start locally
npm run dev
```

### 2. Verify No New Issues
```bash
# Check for vulnerabilities again
npm audit

# Check for outdated packages
npm outdated
```

### 3. Deploy to Vercel
```bash
# Commit changes
git add .
git commit -m "fix: address security vulnerabilities"

# Push to trigger deployment
git push origin main
```

### 4. Monitor Deployment
- Watch Vercel deployment logs
- Test production site
- Check Sentry for new errors

## Prevention

### 1. Enable Dependabot Auto-Updates
In your GitHub repository:
1. Go to Settings → Security & analysis
2. Enable "Dependabot security updates"
3. Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### 2. Regular Maintenance
```bash
# Weekly: Check for updates
npm outdated

# Weekly: Update patch versions
npm update

# Monthly: Review and update major versions
npm-check-updates -u
npm install
```

### 3. CI/CD Security Checks
Add to your CI/CD pipeline:
```yaml
- name: Security Audit
  run: npm audit --audit-level=moderate
```

## When to Seek Help

Consult a security expert if:
- Critical vulnerabilities in production code
- No fix available for a critical vulnerability
- Breaking changes from security updates
- Unsure about impact of a vulnerability

## Resources

- NPM Security Best Practices: https://docs.npmjs.com/packages-and-modules/securing-your-code
- GitHub Dependabot: https://docs.github.com/en/code-security/dependabot
- Snyk Vulnerability Database: https://snyk.io/vuln/
- CVE Details: https://www.cvedetails.com/

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm audit` | Check for vulnerabilities |
| `npm audit fix` | Auto-fix vulnerabilities |
| `npm audit fix --force` | Force fix (may cause breaking changes) |
| `npm update` | Update to latest patch versions |
| `npm outdated` | Show outdated packages |
| `npm install package@latest` | Install latest version of package |

## Current Recommendations

1. **Immediate Action:**
   ```bash
   npm audit fix
   npm test
   git commit -am "fix: auto-fix security vulnerabilities"
   git push
   ```

2. **Review Dependabot:**
   - Visit https://github.com/Kramerbrian/dealership-ai-dashboard/security/dependabot
   - Review each alert
   - Enable auto-merge for low-risk updates

3. **Set Up Monitoring:**
   - Enable Dependabot security updates
   - Configure Sentry for runtime error monitoring
   - Set up weekly security review reminders
