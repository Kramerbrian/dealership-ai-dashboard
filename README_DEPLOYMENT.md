# 🚀 DealershipAI Deployment Guide

**Quick Start:** See `QUICK_DEPLOY.md` for 15-minute setup

## 📋 Overview

This guide covers deploying DealershipAI with:
- **Landing:** `dealershipai.com` (public)
- **Dashboard:** `dash.dealershipai.com` (protected, Clerk auth)
- **SSO:** Single sign-on across both domains

## 🎯 Quick Links

- **Quick Deploy:** `QUICK_DEPLOY.md` (15 minutes)
- **Full Checklist:** `FINAL_DEPLOYMENT_CHECKLIST.md`
- **Clerk SSO:** `docs/CLERK_SSO_SETUP.md`
- **Vercel Guide:** `docs/VERCEL_DEPLOYMENT_GUIDE.md`

## ✅ What's Ready

- ✅ Domain routing configured
- ✅ Middleware updated
- ✅ Documentation complete
- ✅ Scripts created

## ⚠️ What's Needed

1. **Clerk Dashboard Configuration** (5 min)
   - Set cookie domain to `.dealershipai.com`
   - Add allowed origins
   - Configure redirect URLs

2. **Deploy to Vercel** (2-5 min)
   - `vercel --prod`

3. **Test** (5 min)
   - Verify routing
   - Test SSO flow

## 📚 Documentation Structure

```
docs/
├── CLERK_SSO_SETUP.md          # Clerk SSO configuration
├── VERCEL_DEPLOYMENT_GUIDE.md  # Vercel setup
└── PULSE_DASHBOARD_ACTIVATION.md # Pulse dashboard

scripts/
├── verify-deployment-ready.sh  # Pre-deployment check
├── setup-clerk-sso.sh          # Clerk setup helper
└── deploy-vercel-projects.sh   # Deployment automation

Root:
├── QUICK_DEPLOY.md             # Quick reference
├── FINAL_DEPLOYMENT_CHECKLIST.md # Complete checklist
└── DEPLOYMENT_READY.md         # Full guide
```

## 🚀 Start Here

1. **Run verification:**
   ```bash
   ./scripts/verify-deployment-ready.sh
   ```

2. **Configure Clerk:**
   ```bash
   ./scripts/setup-clerk-sso.sh
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Test:**
   - Visit `https://dash.dealershipai.com`
   - Should redirect to `/dashboard` or `/sign-in`

## 🔗 Resources

- **Clerk Docs:** https://clerk.com/docs/authentication/sso
- **Vercel Docs:** https://vercel.com/docs
- **Support:** Check troubleshooting in `DEPLOYMENT_READY.md`

---

**Last Updated:** 2025-01-20

