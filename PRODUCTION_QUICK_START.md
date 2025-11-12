# Production Quick Start - 30 Minutes

## 🚀 Fastest Path to Production

### Step 1: Environment Setup (5 min)

```bash
# 1. Copy example env file
cp .env.production.example .env.local

# 2. Fill in critical keys (minimum):
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY
# - DATABASE_URL
# - SUPABASE_URL + SUPABASE_ANON_KEY
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY
```

### Step 2: Database Setup (10 min)

```bash
# 1. Run Prisma migrations
npx prisma migrate deploy
npx prisma generate

# 2. Initialize vector cache
# Open Supabase SQL Editor → Run SQL from lib/ai/vector-cache.ts
```

### Step 3: Verify Setup (5 min)

```bash
# Run production readiness check
./scripts/check-production-readiness.sh
```

### Step 4: Build & Test (5 min)

```bash
# Build for production
npm run build

# Test locally (production mode)
npm start
```

### Step 5: Deploy (5 min)

```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repo for auto-deploy
```

---

## ✅ Minimum Viable Production

**You can go live with just these:**

1. ✅ Core API keys (Anthropic, OpenAI)
2. ✅ Database connected (Supabase)
3. ✅ Auth working (Clerk)
4. ✅ Basic API routes functional
5. ✅ Error tracking (Sentry)

**Can add later:**
- Voice integration
- Advanced analytics
- Orbital view
- Mobile optimization

---

## 🎯 Critical Path

**Week 1: Infrastructure**
- Day 1-2: Environment variables + Database
- Day 3-4: Core API routes
- Day 5: Testing + Deploy

**Week 2: Features**
- Day 1-2: Command bar + Modals
- Day 3-4: AI orchestration
- Day 5: Polish + Launch

---

## 📞 Need Help?

1. **Check logs**: Vercel dashboard → Functions → Logs
2. **Test endpoints**: `curl https://your-app.vercel.app/api/health`
3. **Database**: Supabase dashboard → SQL Editor
4. **Errors**: Sentry dashboard

---

**Ready? Run the checklist and deploy!** 🚀

