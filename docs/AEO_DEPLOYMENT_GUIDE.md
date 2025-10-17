# AEO Panel Deployment Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Supabase project with database access
- Node.js and npm installed
- Environment variables configured

### Step 1: Database Setup

#### Option A: Using the Setup Script (Recommended)
```bash
# Set your database URL
export DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Run the setup script
./scripts/setup-aeo-database.sh
```

#### Option B: Manual Setup
```bash
# Run migrations in order
psql "$DATABASE_URL" -f db/migrations/001_aeo_base_tables.sql
psql "$DATABASE_URL" -f db/migrations/002_aeo_views.sql
psql "$DATABASE_URL" -f db/migrations/003_aeo_sample_data.sql
```

### Step 2: Verify Database Setup
```sql
-- Check tables were created
SELECT COUNT(*) FROM aeo_runs;
SELECT COUNT(*) FROM aeo_queries;

-- Check views are working
SELECT * FROM aeo_surface_breakdown LIMIT 5;
SELECT * FROM aeo_domain_first_appearances LIMIT 5;
```

### Step 3: Deploy Application

#### For Vercel:
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

#### For other platforms:
```bash
# Build the application
npm run build

# Start the application
npm run start
```

### Step 4: Test the AEO Panel

1. **Visit the Dashboard**: Navigate to `/dashboard/aeo`
2. **Test API Endpoints**:
   - `/api/aeo/leaderboard?days=30`
   - `/api/aeo/breakdown?days=30`
   - `/api/aeo/summary`

### Step 5: Verify Functionality

✅ **Expected Results**:
- AEO Panel appears in sidebar navigation
- Dashboard shows 4 KPI cards with sample data
- Leaderboard displays domain performance
- Breakdown shows answer surface distribution
- All data updates automatically via SWR

## 📊 Sample Data Structure

The setup script creates realistic test data:

### AEO Runs
- 15 runs over the last 30 days
- 100-500 queries per run
- 20-100 queries with answer surfaces

### AEO Queries
- Mix of surface types: AEO, Featured Snippets, PAA, Local Pack
- Sample domains: dealership1.com, dealership2.com, dealership3.com
- Realistic query patterns for automotive industry

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Check database permissions
   - Ensure tables don't already exist

2. **API Routes Not Working**
   - Check authentication middleware
   - Verify tenant_id in JWT token
   - Check database views are created

3. **No Data Showing**
   - Verify sample data was inserted
   - Check RLS policies allow access
   - Confirm tenant_id matches sample data

### Debug Commands:
```bash
# Check database connection
psql "$DATABASE_URL" -c "SELECT version();"

# Verify sample data
psql "$DATABASE_URL" -c "SELECT tenant_id, COUNT(*) FROM aeo_runs GROUP BY tenant_id;"

# Test API endpoints
curl -H "Authorization: Bearer your-jwt-token" http://localhost:3000/api/aeo/summary
```

## 🎯 Next Steps

After successful deployment:

1. **Connect Real Data Sources**
   - Replace sample data with actual AEO monitoring
   - Set up automated data collection
   - Configure real tenant IDs

2. **Add Advanced Features**
   - Period comparison (This 30d vs Prior 30d)
   - Export functionality
   - Real-time updates
   - Alerting system

3. **Integration**
   - Connect with existing analytics
   - Add to reporting workflows
   - Set up automated insights

## 📈 Performance Notes

- Views are optimized for 30-day lookbacks
- Indexes support fast tenant-based queries
- SWR provides efficient client-side caching
- RLS ensures proper tenant isolation

## 🔒 Security

- Row Level Security (RLS) enabled
- Tenant isolation enforced
- JWT-based authentication required
- No sensitive data in client-side code
