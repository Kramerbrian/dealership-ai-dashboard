# Sign-Up Flow Testing Checklist

## Current Status
- ✅ Dev server running on http://localhost:3001
- ✅ Database deployed with 9 tables
- ✅ Clerk authentication configured
- ✅ Pricing page updated with new pricing ($499/$999)

## Test Flow

### 1. Test Pricing Page (Local Development)
Since we're running locally, the pricing page needs to be updated for local testing:

**Current Configuration:**
- AUTH_URL: `https://www.dealershipai.com`
- DASHBOARD_URL: `https://dash.dealershipai.com`

**For Local Testing, we need:**
- AUTH_URL: `http://localhost:3001`
- DASHBOARD_URL: `http://localhost:3001`

### 2. Sign-Up Flow Steps

#### Test Free Tier:
1. Open http://localhost:3001/pricing.html
2. Click "Get Started Free" button
3. Should redirect to: http://localhost:3001/sign-up
4. Complete sign-up with test email
5. After sign-up, should redirect to dashboard
6. Verify user created in database:
   ```bash
   node test-user-creation.js
   ```

#### Test Pro Tier:
1. Open http://localhost:3001/pricing.html
2. Click "Start Pro Trial" button
3. Should redirect to: http://localhost:3001/sign-up
4. localStorage should contain: `selected_tier: 'pro'`
5. Complete sign-up
6. Should redirect to: http://localhost:3001/dashboard?upgrade=pro

#### Test Enterprise Tier:
1. Click "Contact Sales" button
2. Should redirect to: http://localhost:3001/sign-up
3. localStorage should contain: `selected_tier: 'enterprise'`

### 3. Database Verification

After sign-up, verify:
- User record created in `users` table
- Tenant record created in `tenants` table
- User linked to correct tenant
- Subscription tier set correctly

### 4. Production Configuration

For production deployment:
- pricing.html already configured with production URLs
- Clerk webhooks will handle user sync to database
- Need to set up Stripe for payment processing

## Next Steps

1. **Immediate:** Update pricing.html for local testing
2. **Test:** Complete full sign-up flow
3. **Verify:** Check database for user creation
4. **Deploy:** Test on production domains
5. **Configure:** Set up Stripe integration
