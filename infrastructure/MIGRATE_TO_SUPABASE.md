# Migrate Infrastructure to Supabase Storage

This guide explains how to store infrastructure documentation and configuration in Supabase Storage.

## Option 1: Using the Node.js Script

### Prerequisites

```bash
npm install @supabase/supabase-js
```

### Setup Environment Variables

```bash
export SUPABASE_URL="https://jhftjurcpewsagbkbtmv.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
```

Or create a `.env` file:

```bash
SUPABASE_URL=https://jhftjurcpewsagbkbtmv.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Run Migration

```bash
cd /workspace/infrastructure
node migrate-to-supabase.js
```

## Option 2: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/jhftjurcpewsagbkbtmv
2. Navigate to **Storage** → **Buckets**
3. Create a new bucket named `infrastructure` (if it doesn't exist)
4. Upload files manually or use the API

## Option 3: Using Supabase CLI

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login

```bash
supabase login
```

### Upload Files

```bash
# Create bucket (if needed)
supabase storage create-bucket infrastructure

# Upload directory
cd /workspace/infrastructure/terraform
supabase storage upload infrastructure/terraform --bucket infrastructure
```

## Option 4: Using Python Script

```python
from supabase import create_client, Client
import os
from pathlib import Path

url = "https://jhftjurcpewsagbkbtmv.supabase.co"
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

# Upload files
for file_path in Path("terraform").rglob("*"):
    if file_path.is_file() and not file_path.name.endswith(('.tfstate', '.zip')):
        with open(file_path, 'rb') as f:
            storage_path = f"terraform/{file_path.relative_to('terraform')}"
            supabase.storage.from_("infrastructure").upload(
                storage_path,
                f.read(),
                file_options={"content-type": "text/plain"}
            )
```

## What Gets Stored

The migration will upload:
- ✅ All `.tf` Terraform files
- ✅ Documentation (`.md` files)
- ✅ Lambda code (`.py` files)
- ✅ Scripts (`.sh` files)
- ❌ Excludes: `.tfstate`, `.zip`, `.log` files

## Accessing Files

After migration, access files via:

1. **Supabase Dashboard**: Storage → infrastructure bucket
2. **API**: `GET /storage/v1/object/infrastructure/terraform/{path}`
3. **Public URL** (if bucket is public): `https://jhftjurcpewsagbkbtmv.supabase.co/storage/v1/object/public/infrastructure/terraform/{path}`

## Recommended Structure in Supabase

```
infrastructure/
└── terraform/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── README.md
    └── modules/
        ├── vpc/
        ├── security/
        ├── eks/
        └── ...
```

## Security Notes

- Use **Service Role Key** (not anon key) for uploads
- Keep bucket **private** for sensitive configurations
- Use **Row Level Security** if storing in database tables
- Never store `.tfvars` with real credentials

## Alternative: Store in Database Table

Instead of Storage, you could store infrastructure metadata in a table:

```sql
CREATE TABLE infrastructure_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path TEXT NOT NULL,
  content TEXT,
  file_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Then insert via Supabase API or dashboard.
