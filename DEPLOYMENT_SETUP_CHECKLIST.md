# 🚀 Production Deployment Setup Checklist

## Prerequisites
- [ ] GitHub repository created
- [ ] Supabase project created
- [ ] Vercel account created
- [ ] All environment variables ready

## 1. Environment Variables Setup

### Create `.env.local` from template
```bash
cp env.example .env.local
# Edit .env.local with your actual values
```

### Required Environment Variables
- [ ] `NEXT_PUBLIC_APP_NAME=dealershipAI`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `OPENAI_API_KEY=sk-...`
- [ ] `ANTHROPIC_API_KEY=sk-ant-...`
- [ ] `JWT_SECRET=change_me`
- [ ] `ENCRYPTION_KEY=32charstringrequired_32charstring`

## 2. Supabase Setup

### Database Schema Deployment
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy contents of `database/governance-schema.sql`
- [ ] Execute SQL to create governance tables
- [ ] Verify tables created:
  - [ ] `governance_rules`
  - [ ] `model_weights`
  - [ ] `governance_actions`
  - [ ] `governance_violations`

### Supabase Configuration
- [ ] Update `supabase/config.toml` with your project ID
- [ ] Link GitHub repository in Supabase → Settings → Integrations → GitHub

## 3. Vercel Setup

### Project Configuration
- [ ] Go to Vercel Dashboard
- [ ] Click "Add New" → "Project"
- [ ] Import GitHub repository
- [ ] Authorize Vercel GitHub App

### Environment Variables in Vercel
- [ ] Go to Project → Settings → Environment Variables
- [ ] Add all environment variables from `env.example`
- [ ] Promote all variables to Production
- [ ] Verify `vercel.json` configuration

### Vercel Configuration Files
- [ ] `vercel.json` updated with proper build settings
- [ ] Environment variables mapped correctly
- [ ] Cron jobs configured for governance checks

## 4. GitHub Actions Setup

### Repository Secrets
Go to GitHub → Repository → Settings → Secrets and variables → Actions
Add these secrets:
- [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `JWT_SECRET`
- [ ] `ENCRYPTION_KEY`
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

### Workflow Configuration
- [ ] `.github/workflows/deploy.yml` created
- [ ] Workflow triggers on main branch push
- [ ] Manual workflow dispatch enabled

## 5. Local Development Setup

### Install Dependencies
```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Development Server
```bash
# Start development server
pnpm dev
```

### Verify Local Setup
- [ ] Application starts on http://localhost:3000
- [ ] No console errors
- [ ] Supabase connection working
- [ ] API endpoints responding

## 6. Production Deployment

### Deploy Governance System
```bash
# Run governance deployment script
pnpm run deploy:governance
```

### Verify Deployment
- [ ] Application accessible at production URL
- [ ] Governance API endpoints working
- [ ] Model Health Tiles visible in dashboard
- [ ] Database connections working
- [ ] Cron jobs scheduled

## 7. Testing and Validation

### Governance System Tests
```bash
# Run governance threshold tests
node scripts/test-day3-governance-thresholds.js

# Run end-to-end integration tests
node scripts/test-end-to-end-integration.js
```

### API Endpoint Tests
```bash
# Test governance API
curl -X POST https://your-domain.com/api/governance/check \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "test", "metrics": {"r2": 0.65, "rmse": 4.2}}'

# Test model health API
curl https://your-domain.com/api/model-health/summary
```

### Dashboard Verification
- [ ] Model Health Tiles displaying correctly
- [ ] Governance status indicators working
- [ ] Violation alerts functioning
- [ ] Real-time updates working

## 8. Monitoring and Maintenance

### Set Up Monitoring
- [ ] Vercel analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring set up

### Governance Monitoring
- [ ] Governance violations dashboard
- [ ] Model freeze notifications
- [ ] Performance degradation alerts
- [ ] Audit trail logging

## 9. Security and Compliance

### Security Checklist
- [ ] Environment variables secured
- [ ] API endpoints protected
- [ ] Database access restricted
- [ ] CORS configured properly
- [ ] Rate limiting implemented

### Compliance
- [ ] Data privacy policies in place
- [ ] Audit logging enabled
- [ ] Access controls configured
- [ ] Backup procedures established

## 10. Documentation and Training

### Documentation
- [ ] API documentation updated
- [ ] Deployment guide created
- [ ] Troubleshooting guide written
- [ ] Governance rules documented

### Team Training
- [ ] Governance system overview
- [ ] Dashboard usage training
- [ ] Emergency procedures
- [ ] Maintenance procedures

## Success Criteria

✅ **Deployment Complete When:**
- [ ] All tests passing
- [ ] Application accessible in production
- [ ] Governance system operational
- [ ] Monitoring active
- [ ] Team trained
- [ ] Documentation complete

## Troubleshooting

### Common Issues
1. **Environment Variables**: Verify all required variables are set
2. **Database Connection**: Check Supabase credentials and network access
3. **Build Errors**: Review build logs and fix TypeScript/ESLint errors
4. **API Errors**: Check API endpoint logs and database permissions
5. **Deployment Failures**: Review GitHub Actions logs and Vercel deployment logs

### Support Resources
- [ ] Vercel Documentation
- [ ] Supabase Documentation
- [ ] Next.js Documentation
- [ ] GitHub Actions Documentation

---

🎉 **Congratulations!** Your governance system is now deployed and protecting your AI models in production!
