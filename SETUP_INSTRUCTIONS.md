# 🚀 DealershipAI Complete Setup Instructions

## Step 1: Install Dependencies

**Note:** If you encounter npm permission errors, run:
```bash
sudo chown -R $(whoami) ~/.npm
```

Then install:
```bash
npm install @react-email/components @react-email/render mixpanel-browser
```

### Optional (for PDF/Excel reports):
```bash
npm install react-pdf puppeteer exceljs
```

---

## Step 2: Set Environment Variables

Create `.env.local` from `.env.example.complete`:

```bash
cp .env.example.complete .env.local
```

**Required variables to fill in:**

### Critical (must have):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `DATABASE_URL` - Your PostgreSQL connection string
- `RESEND_API_KEY` - From Resend.com
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook settings

### Important (for full functionality):
- `NEXT_PUBLIC_MIXPANEL_TOKEN` - For analytics
- `ANTHROPIC_API_KEY` - For agent chat
- `REDIS_URL` - For caching and queues
- `WEBHOOK_SECRET` - Random secret for webhook signatures
- `INTERNAL_API_SECRET` - Random secret for internal API calls

### Optional:
- `SENTRY_DSN` - Error tracking
- `GMB_API_KEY` - Google My Business API
- `GSC_API_KEY` - Google Search Console API

---

## Step 3: Database Setup

### Create Required Tables

Run these SQL migrations or add to Prisma schema:

```sql
-- Onboarding sessions
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage logs (for billing)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL,
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Data exports (GDPR)
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  export_id TEXT UNIQUE NOT NULL,
  data JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Or use Prisma migrations:**
```bash
npx prisma migrate dev --name add_complete_systems
```

---

## Step 4: Update Prisma Schema (if needed)

Add to `prisma/schema.prisma`:

```prisma
model OnboardingSession {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  url       String
  results   Json?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("onboarding_sessions")
}

model UsageLog {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  action    String
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, createdAt])
  @@map("usage_logs")
}

model Webhook {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  url       String
  events    Json
  secret    String
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("webhooks")
}

model DataExport {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  exportId  String   @unique @map("export_id")
  data      Json?
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("data_exports")
}
```

Then run:
```bash
npx prisma generate
npx prisma db push
```

---

## Step 5: Update API Routes with Database

The following files need database integration:

1. **`app/api/billing/portal/route.ts`**
   - Replace `getOrCreateStripeCustomer` with function from `lib/db/integrations.ts`

2. **`app/dashboard/billing/page.tsx`**
   - Use `getUserSubscription` and `getUserUsage` from integrations

3. **`app/api/admin/stats/route.ts`**
   - Use `getAdminStats` from integrations

4. **`app/api/admin/check-access/route.ts`**
   - Use `checkAdminRole` from integrations

5. **`app/api/gdpr/export/route.ts`**
   - Use `exportUserData` from integrations

6. **`app/api/gdpr/delete/route.ts`**
   - Use `scheduleAccountDeletion` from integrations

---

## Step 6: Test Systems

Run the test script:
```bash
./scripts/test-systems.sh
```

Or test manually:
```bash
# Start dev server
npm run dev

# In another terminal, test endpoints:
curl http://localhost:3000/onboard/step-1
curl http://localhost:3000/legal/terms
curl http://localhost:3000/help
```

---

## Step 7: Verify Environment

Check all services are configured:

```bash
# Check if variables are set
node -e "
  console.log('Clerk:', !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  console.log('Database:', !!process.env.DATABASE_URL);
  console.log('Resend:', !!process.env.RESEND_API_KEY);
  console.log('Stripe:', !!process.env.STRIPE_SECRET_KEY);
  console.log('Mixpanel:', !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);
"
```

---

## Step 8: Production Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations run
- [ ] Stripe webhook endpoints configured
- [ ] Resend domain verified
- [ ] Mixpanel project created and token set
- [ ] Clerk application configured with redirect URLs
- [ ] Test onboarding flow end-to-end
- [ ] Test email sending (use Resend test mode)
- [ ] Test billing portal (Stripe test mode)
- [ ] Verify analytics tracking
- [ ] Test webhook delivery
- [ ] Verify GDPR endpoints work

---

## Troubleshooting

### npm permission errors
```bash
sudo chown -R $(whoami) ~/.npm
```

### Database connection errors
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Check SSL requirements (add `?sslmode=require` if needed)

### Missing packages
If imports fail, verify installation:
```bash
npm list @react-email/components @react-email/render mixpanel-browser
```

### TypeScript errors
Run:
```bash
npm run type-check
```

---

## Next Steps

1. **Complete Email Templates**: Finish daily digest, weekly report, critical alerts
2. **Add PDF/Excel Libraries**: For full report generation
3. **Create Help Articles**: Add MDX content for knowledge base
4. **Set Up Monitoring**: Configure Sentry and analytics dashboards
5. **Load Testing**: Test all endpoints under load

**You're ready to deploy! 🚀**
