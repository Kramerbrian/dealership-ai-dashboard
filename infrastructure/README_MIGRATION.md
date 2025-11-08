# Infrastructure Migration Guide

This directory contains complete Terraform infrastructure code for the Auction Intelligence Mesh (AIM) system.

## Quick Migration

### To GitHub Repository

```bash
bash migrate-to-github.sh
```

This will:
1. Clone https://github.com/Kramerbrian/AppraiseYourVehicle.git
2. Copy all infrastructure files
3. Commit and push to the repository

**Note**: If the repository is private or doesn't exist, you'll need to:
- Create it on GitHub first, OR
- Provide authentication credentials

### To Supabase Storage

**Option 1: Using Node.js Script**
```bash
export SUPABASE_URL="https://jhftjurcpewsagbkbtmv.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"
npm install @supabase/supabase-js
node migrate-to-supabase.js
```

**Option 2: Using Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/jhftjurcpewsagbkbtmv
2. Navigate to Storage → Create bucket "infrastructure"
3. Upload files manually

**Option 3: Using Supabase CLI**
```bash
supabase login
supabase storage create-bucket infrastructure
supabase storage upload terraform --bucket infrastructure
```

### Complete Migration (Both)

```bash
bash migrate-all.sh
```

## What Gets Migrated

### GitHub Repository
- ✅ All Terraform files (`.tf`)
- ✅ All modules
- ✅ Documentation (`.md` files)
- ✅ Lambda code (`.py` files)
- ✅ Scripts (`.sh` files)
- ❌ Excludes: `.tfstate`, `.tfvars`, `.terraform/`

### Supabase Storage
- ✅ Same files as GitHub
- ✅ Stored in `infrastructure/terraform/` bucket
- ❌ Excludes: `.tfstate`, `.zip`, `.log` files

## File Structure

```
infrastructure/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── README.md
│   ├── modules/
│   │   ├── vpc/
│   │   ├── security/
│   │   ├── eks/
│   │   ├── msk/
│   │   ├── redshift/
│   │   ├── s3/
│   │   ├── sagemaker/
│   │   ├── bedrock/
│   │   ├── api_gateway/
│   │   └── compliance/
│   └── ...
├── migrate-to-github.sh
├── migrate-to-supabase.js
├── migrate-all.sh
├── MIGRATE_TO_GITHUB.md
└── MIGRATE_TO_SUPABASE.md
```

## Manual Migration Steps

### GitHub

1. **Clone repository**:
   ```bash
   git clone https://github.com/Kramerbrian/AppraiseYourVehicle.git
   cd AppraiseYourVehicle
   ```

2. **Copy files**:
   ```bash
   cp -r /workspace/infrastructure ./infrastructure
   ```

3. **Commit and push**:
   ```bash
   git add infrastructure/
   git commit -m "Add AIM Terraform infrastructure"
   git push origin main
   ```

### Supabase

1. **Create bucket** (via Dashboard or API)
2. **Upload files** using one of the methods above
3. **Verify** in Storage section of dashboard

## Troubleshooting

### GitHub Issues

- **Repository not found**: Create it on GitHub first
- **Authentication required**: Use `git config credential.helper store`
- **Permission denied**: Check repository access permissions

### Supabase Issues

- **Missing environment variables**: Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- **Bucket doesn't exist**: Create it via Dashboard first
- **Upload fails**: Check service key permissions

## Next Steps After Migration

1. **Review files** in both locations
2. **Update configuration**:
   - Update `main.tf` backend S3 bucket
   - Create `terraform.tfvars` with your values
3. **Initialize Terraform**:
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform plan
   ```
4. **Deploy infrastructure**:
   ```bash
   terraform apply
   ```

## Security Reminders

- ⚠️ **Never commit** `.tfvars` files with real passwords
- ⚠️ **Never commit** `.tfstate` files
- ⚠️ **Use secrets management** for sensitive values
- ⚠️ **Review** `.gitignore` before committing

## Support

For issues:
- Check `MIGRATE_TO_GITHUB.md` for GitHub-specific help
- Check `MIGRATE_TO_SUPABASE.md` for Supabase-specific help
- Review Terraform documentation in `terraform/README.md`
