# Adding Dealership Data Guide

There are 3 ways to add dealership data to your dashboard:

## Method 1: Via Supabase SQL Editor (Easiest)

1. Open Supabase SQL Editor:
   ```bash
   open "https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new"
   ```

2. Copy the SQL from `add-dealership.sql`
3. Get your tenant ID first, then insert the dealership data
4. Run the query

## Method 2: Via Dashboard API (Recommended for Multiple)

Create a script to bulk upload:

```bash
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise

cat > bulk-add-dealerships.js << 'SCRIPT'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vxrdvkhkombwlhjvtsmw.supabase.co',
  'YOUR_SERVICE_ROLE_KEY'
);

const dealerships = [
  {
    name: 'AutoNation Toyota',
    website: 'https://www.autonationtoyota.com',
    domain: 'autonationtoyota.com',
    location: 'Fort Myers, FL',
    ai_visibility_score: 82
  },
  {
    name: 'Germain Honda',
    website: 'https://www.germainhonda.com',
    domain: 'germainhonda.com',
    location: 'Naples, FL',
    ai_visibility_score: 78
  },
  // Add more dealerships...
];

async function addDealerships() {
  // Get first tenant
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id')
    .limit(1);
  
  const tenantId = tenants[0].id;
  
  // Add each dealership
  for (const dealer of dealerships) {
    const { data, error } = await supabase
      .from('dealership_data')
      .insert({
        ...dealer,
        tenant_id: tenantId,
        last_audit_date: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error adding', dealer.name, error);
    } else {
      console.log('✓ Added', dealer.name);
    }
  }
}

addDealerships();
SCRIPT

# Run it
node bulk-add-dealerships.js
```

## Method 3: Via Dashboard UI (When Available)

Once authentication is set up:

1. Log into dashboard: https://dealershipai-enterprise-6m0culy9w-brian-kramers-projects.vercel.app
2. Go to "Dealerships" section
3. Click "Add Dealership"
4. Fill in the form
5. Submit

## Sample Dealership Data

Here's a list of real Florida dealerships you can add:

```sql
-- Get tenant ID first
SELECT id FROM tenants LIMIT 1;

-- Then add dealerships (replace TENANT_ID with actual ID)
INSERT INTO dealership_data (tenant_id, name, website, domain, location, ai_visibility_score) VALUES
('TENANT_ID', 'AutoNation Toyota Fort Myers', 'https://www.autonationtoyotafortmyers.com', 'autonationtoyotafortmyers.com', 'Fort Myers, FL', 85),
('TENANT_ID', 'Germain Honda of Naples', 'https://www.germainhondaofnaples.com', 'germainhondaofnaples.com', 'Naples, FL', 78),
('TENANT_ID', 'Sunset Dodge Chrysler Jeep', 'https://www.sunsetdodge.com', 'sunsetdodge.com', 'Sarasota, FL', 72),
('TENANT_ID', 'Crown Honda Southpoint', 'https://www.crownhondasouthpoint.com', 'crownhondasouthpoint.com', 'Durham, NC', 88),
('TENANT_ID', 'Phillips Chevrolet', 'https://www.phillipschevrolet.com', 'phillipschevrolet.com', 'Frankfort, IL', 81);
```

## Quick Add Script

Run this to add sample data quickly:

```bash
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise
pbcopy < add-dealership.sql
open "https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new"
# Paste and run the SQL
```

## Verify Data Added

```sql
SELECT 
  COUNT(*) as total_dealerships,
  AVG(ai_visibility_score) as avg_score,
  MAX(ai_visibility_score) as highest_score,
  MIN(ai_visibility_score) as lowest_score
FROM dealership_data;
```

## Next Steps

After adding dealerships:
1. View them in the dashboard
2. Run audits on each dealership
3. Generate reports
4. Track score improvements over time
