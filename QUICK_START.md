# ⚡ Quick Start - Apply Migration

## ✅ Step 1: Paste SQL in Supabase SQL Editor

**The migration SQL is already in your clipboard!**

### In your Supabase SQL Editor:

1. **Paste** (Cmd+V or Ctrl+V)
2. **Click "Run"** (bottom right)
3. **Verify success** - Should see: `Success. No rows returned`

---

## ✅ Step 2: Verify Tables Created

Run this in SQL Editor:

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%aemd%' OR tablename LIKE '%accuracy%')
ORDER BY tablename;
```

**Expected: 4 tables**
- accuracy_alerts
- accuracy_monitoring  
- accuracy_thresholds
- aemd_metrics

---

## ✅ Step 3: Test APIs

In your terminal:

```bash
cd /Users/briankramer/dealership-ai-dashboard
./scripts/test-aemd-accuracy.sh
```

---

## ✅ Step 4: View Dashboard

```
http://localhost:3000/monitoring?tenant=test-tenant
```

Done! 🎉
