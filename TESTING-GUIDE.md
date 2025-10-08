# DealershipAI Testing Guide

## 🧪 Test 1: Sign-up Flow from Pricing Page

### Test Steps
1. Open pricing page (already open in browser)
2. Click "Get Started Free" button
3. Should redirect to Clerk sign-up at https://www.dealershipai.com/sign-up
4. Complete sign-up
5. Should redirect to dashboard

### Checklist
- [ ] Free tier button redirects correctly
- [ ] Pro tier button redirects correctly  
- [ ] Enterprise tier button redirects correctly
- [ ] localStorage stores selected tier
- [ ] Clerk sign-up page loads
- [ ] Dashboard accessible after auth

## 🗄️ Test 2: Deploy Full Enterprise Schema

### Quick Deploy
```bash
# Copy full schema
pbcopy < dealershipai-enterprise/supabase-schema.sql

# Open SQL editor and paste
open "https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new"
```

### Verify
```bash
node test-db-simple.js
```

## 🔒 Test 3: Enable RLS (Production Only)

**Status**: Keep disabled for development
**When**: Enable before production deployment

## 💳 Test 4: Stripe Configuration

**Status**: Not configured yet
**Next**: Create Stripe account and products

---

**Created**: October 7, 2025
