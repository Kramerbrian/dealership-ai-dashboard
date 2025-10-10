# Security Schema Verification & Next Steps

## 🔒 Step 1: Execute Security Schema

**SQL Editor:** https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new

1. Copy the entire contents of `database/security-schema.sql` (all 399 lines)
2. Paste into SQL Editor
3. Click **Run** (or Ctrl+Enter / Cmd+Enter)
4. Wait for completion (~5-10 seconds)

## ✅ Step 2: Verification Queries

After execution, run these queries to verify everything was created correctly:

### 2.1 Check All Tables Created

```sql
SELECT
    table_name,
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE columns.table_name = tables.table_name
     AND columns.table_schema = 'public') as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'security_events',
    'access_controls',
    'security_rules',
    'api_keys',
    'security_alerts',
    'audit_log',
    'model_access_log'
)
ORDER BY table_name;
```

**Expected Result:** 7 tables
```
access_controls   | 10
api_keys          | 10
audit_log         | 10
model_access_log  | 10
security_alerts   | 11
security_events   | 11
security_rules    | 7
```

### 2.2 Verify Security Rules Populated

```sql
SELECT name, action, severity, is_active
FROM security_rules
ORDER BY severity DESC, name;
```

**Expected Result:** 9 security rules
```
Admin Privilege Escalation      | alert   | critical | true
Unauthorized Model Access        | alert   | critical | true
Large Data Export                | block   | high     | true
Multiple Failed Logins           | lockout | high     | true
Suspicious Data Pattern          | alert   | high     | true
Security Rule Modification       | audit   | high     | true
Rapid API Requests               | block   | medium   | true
System Configuration Change      | audit   | medium   | true
Unusual IP Access                | alert   | medium   | true
```

### 2.3 Verify Access Controls Populated

```sql
SELECT user_id, role, array_length(permissions, 1) as perm_count
FROM access_controls
ORDER BY
    CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'governance_admin' THEN 2
        WHEN 'model_engineer' THEN 3
        WHEN 'viewer' THEN 4
    END;
```

**Expected Result:** 4 default users
```
admin@dealershipai.com       | super_admin       | 1 (wildcard)
governance@dealershipai.com  | governance_admin  | 5
engineer@dealershipai.com    | model_engineer    | 2
viewer@dealershipai.com      | viewer            | 1
```

### 2.4 Verify Indexes Created

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('security_events', 'access_controls', 'security_alerts', 'audit_log', 'model_access_log')
ORDER BY tablename, indexname;
```

**Expected Result:** ~20 indexes across all security tables

### 2.5 Verify Functions Created

```sql
SELECT
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'check_user_permissions',
    'log_security_event',
    'check_rate_limit',
    'audit_trigger_function'
)
ORDER BY routine_name;
```

**Expected Result:** 4 functions
```
audit_trigger_function   | FUNCTION | trigger
check_rate_limit         | FUNCTION | boolean
check_user_permissions   | FUNCTION | boolean
log_security_event       | FUNCTION | uuid
```

### 2.6 Verify RLS Enabled

```sql
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('security_events', 'access_controls', 'security_rules', 'api_keys', 'security_alerts', 'audit_log', 'model_access_log')
ORDER BY tablename;
```

**Expected Result:** All 7 tables should have `rowsecurity = true`

### 2.7 Test Security Functions

```sql
-- Test permission check (should return false - user doesn't exist)
SELECT check_user_permissions('test@example.com', 'model', 'read');

-- Test permission check (should return true - admin has wildcard)
SELECT check_user_permissions('admin@dealershipai.com', 'model', 'read');

-- Test rate limiting (should return true - no requests yet)
SELECT check_rate_limit('127.0.0.1');
```

**Expected Results:**
- First query: `false`
- Second query: `true`
- Third query: `true`

## 📊 Step 3: Apply Monitoring Tables

After security schema is verified, apply the monitoring tables:

### 3.1 Cron Monitoring Tables

```bash
cat supabase/migrations/20250109_add_cron_monitoring_tables.sql
```

Copy output → Paste in SQL Editor → Run

**Creates:**
- `review_anomalies` (FraudGuard anomaly tracking)
- `forecasts` (Kalman-smoothed AIV forecasts)
- `cron_job_executions` (Execution logs)
- `cron_job_health` (Health monitoring with 5 pre-configured jobs)

### 3.2 System Alerts Table

```bash
cat supabase/migrations/20250109_add_system_alerts_table.sql
```

Copy output → Paste in SQL Editor → Run

**Creates:**
- `system_alerts` (Automated alert management)
- Alert generation and acknowledgment functions

### 3.3 Verify Monitoring Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('review_anomalies', 'forecasts', 'cron_job_executions', 'cron_job_health', 'system_alerts')
ORDER BY table_name;
```

**Expected Result:** 5 tables

### 3.4 Check Cron Jobs Initialized

```sql
SELECT job_name, endpoint, schedule, health_status
FROM cron_job_health
ORDER BY job_name;
```

**Expected Result:** 5 cron jobs
```
evaluate-aiv           | /api/train/evaluate    | 0 0 * * 0   | healthy
fraudguard-scan        | /api/anomaly/reviews   | 0 */6 * * * | healthy
generate-roi-report    | /api/reports/roi       | 0 0 1 * *   | healthy
predict-forecast       | /api/predict/forecast  | 0 0 * * 0   | healthy
retrain-aiv            | /api/train/reinforce   | 0 0 * * *   | healthy
```

## 🎯 Step 4: Test Your Control Rule

Now you can test your specific monitoring query:

```sql
-- Your control rule query
SELECT *
FROM model_audit
WHERE r2 < 0.7 OR rmse > 3.5;
```

**Note:** This will return 0 rows initially until you apply the model_audit schema and cron jobs start populating data.

### Apply Model Audit Schema (Optional but Recommended)

```bash
cat database/model-audit-schema.sql
```

Copy output → Paste in SQL Editor → Run

**Creates:**
- `model_audit` (Performance metrics: R², RMSE, accuracy)
- `model_weights` (Model version tracking)
- `model_performance_history` (Historical tracking)

## 🔍 Step 5: Complete System Verification

Run this comprehensive query to see everything:

```sql
WITH table_counts AS (
    SELECT
        'security_events' as table_name,
        COUNT(*) as row_count
    FROM security_events
    UNION ALL
    SELECT 'access_controls', COUNT(*) FROM access_controls
    UNION ALL
    SELECT 'security_rules', COUNT(*) FROM security_rules
    UNION ALL
    SELECT 'security_alerts', COUNT(*) FROM security_alerts
    UNION ALL
    SELECT 'cron_job_health', COUNT(*) FROM cron_job_health
    UNION ALL
    SELECT 'system_alerts', COUNT(*) FROM system_alerts
)
SELECT
    table_name,
    row_count,
    CASE
        WHEN table_name = 'access_controls' AND row_count = 4 THEN '✅ 4 default users'
        WHEN table_name = 'security_rules' AND row_count = 9 THEN '✅ 9 security rules'
        WHEN table_name = 'cron_job_health' AND row_count = 5 THEN '✅ 5 cron jobs'
        WHEN row_count = 0 THEN '⚪ Empty (expected)'
        ELSE '✅ Populated'
    END as status
FROM table_counts
ORDER BY table_name;
```

## 📈 What You've Deployed

### Security Framework (7 Tables)
- ✅ Complete audit trail of all actions
- ✅ Role-based access control (4 roles)
- ✅ Automated security rules (9 pre-configured)
- ✅ API key management with rate limiting
- ✅ Security event logging and alerting
- ✅ IP-based access tracking
- ✅ Model access protection

### Monitoring System (5 Tables)
- ✅ Cron job execution tracking
- ✅ Health monitoring with alerts
- ✅ Anomaly detection logs
- ✅ Forecast storage (Kalman-smoothed)
- ✅ System alert management

### Success Criteria Tracking
- ✅ R² ≥ 0.8 (tracked in model_audit)
- ✅ RMSE thresholds (your control rule: < 3.5)
- ✅ Accuracy monitoring (≥ 10% MoM)

## 🚀 Next: Activate in Production

Once all tables are verified:

1. **Check Vercel Deployment**
   - https://vercel.com/brian-kramers-projects/dealership-ai-dashboard
   - Verify build succeeded
   - Check deployment logs

2. **Verify Cron Jobs Active**
   - https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/crons
   - Should see 6 active cron jobs

3. **Test API Endpoints**
   ```bash
   DEPLOY_URL="your-deployment.vercel.app"

   # Executive summary
   curl "https://$DEPLOY_URL/api/monitoring/system-health?query=executive-summary"

   # Control rules (your query)
   curl "https://$DEPLOY_URL/api/monitoring/system-health?query=control-rules"

   # Cron health
   curl "https://$DEPLOY_URL/api/cron/health"
   ```

4. **Monitor First Execution**
   - Wait for next scheduled cron run
   - Check `cron_job_executions` table
   - Verify data flowing into monitoring tables

---

**Status:** Ready to execute! Start with Step 1 above.
