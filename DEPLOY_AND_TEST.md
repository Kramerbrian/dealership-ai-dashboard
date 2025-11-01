# 🚀 Deploy to Production & Test Share Flow

## ✅ **Step 1: Run Database Migration**

### **Via Supabase Dashboard** (Recommended)
1. Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb
2. Go to **SQL Editor**
3. Copy SQL from `supabase/migrations/001_add_share_events.sql`
4. Paste and click **Run**
5. Verify in **Table Editor** that `share_events` table exists

---

## ✅ **Step 2: Deploy to Production**

```bash
cd /Users/stephaniekramer/dealership-ai-dashboard

# Generate Prisma client (if schema changed)
npx prisma generate

# Build and deploy
npx vercel --prod --force
```

**Or use the automated script:**
```bash
npx vercel --prod --force
```

---

## ✅ **Step 3: Test Share Flow**

### **Test 1: Track Share (POST)**
```bash
curl -X POST https://dealershipai-app.com/api/share/track \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "terryreidhyundai.com",
    "featureName": "Competitive Comparison",
    "platform": "twitter",
    "shareUrl": "https://dealershipai-app.com",
    "sessionId": "test_session_123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "shareId": "share_abc123",
  "unlockExpiresAt": "2025-02-01T12:00:00Z",
  "message": "Share tracked successfully. Feature unlocked for 24 hours."
}
```

### **Test 2: Check Unlock Status (GET)**
```bash
curl "https://dealershipai-app.com/api/share/track?featureName=Competitive%20Comparison&sessionId=test_session_123"
```

**Expected Response:**
```json
{
  "isUnlocked": true,
  "unlockExpiresAt": "2025-02-01T12:00:00Z",
  "timeRemaining": 86400
}
```

### **Test 3: Test Landing Page Flow**
1. Visit: https://dealershipai-app.com
2. Enter a dealership URL (e.g., `terryreidhyundai.com`)
3. Click "Analyze Free"
4. Wait for results
5. Click "Share to Unlock" on blurred section
6. Share on Twitter/LinkedIn/Facebook or copy link
7. Verify feature unblurs immediately

---

## ✅ **Test Checklist**

- [ ] Migration SQL run successfully
- [ ] `share_events` table exists in database
- [ ] Indexes created successfully
- [ ] POST `/api/share/track` works
- [ ] GET `/api/share/track` returns correct unlock status
- [ ] Landing page shows share modal
- [ ] Share buttons open social platforms
- [ ] Copy link works
- [ ] Feature unblurs after share
- [ ] Unlock persists on page reload

---

## 🐛 **Troubleshooting**

### **Migration Fails:**
- Check if `opportunities` table exists first
- Verify connection string is correct
- Check Supabase logs for errors

### **API Returns 500:**
- Check if `share_events` table exists
- Verify Prisma client is generated (`npx prisma generate`)
- Check Vercel logs: `vercel logs`

### **Feature Doesn't Unblur:**
- Check browser console for errors
- Verify localStorage has unlock data
- Check unlock expiration hasn't passed

---

## 📊 **Verify Database**

Run in Supabase SQL Editor:
```sql
-- Check table exists
SELECT COUNT(*) FROM share_events;

-- Check recent shares
SELECT * FROM share_events ORDER BY "createdAt" DESC LIMIT 5;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'share_events';
```

---

**Status**: Ready to deploy and test! 🚀
