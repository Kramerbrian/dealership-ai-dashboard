# Security Checklist - Before Committing

## ⚠️ CRITICAL: Review Before Every Commit

### Files to NEVER Commit

- [ ] `terraform.tfvars` - Contains sensitive values
- [ ] `*.tfstate` - Contains infrastructure state and secrets
- [ ] `*.tfstate.*` - Backup state files
- [ ] `backend.hcl` - May contain bucket names and credentials
- [ ] `.env` files - Environment variables
- [ ] `*.pem`, `*.key` - Private keys
- [ ] `credentials.json` - AWS credentials
- [ ] `secrets/` directory - Any secrets directory

### Pre-Commit Checks

1. **Verify .gitignore is working**:
   ```bash
   git status
   # Should NOT show any .tfvars, .tfstate, or .env files
   ```

2. **Check for sensitive data**:
   ```bash
   # Search for potential secrets
   grep -r "password\|secret\|key\|token" --include="*.tf" --exclude-dir=".terraform" .
   # Review any matches - ensure no hardcoded secrets
   ```

3. **Verify backend configuration**:
   ```bash
   # Check main.tf backend block
   grep -A 10 "backend" main.tf
   # Should use variables or be commented out
   ```

4. **Review variable files**:
   ```bash
   # Only example files should be committed
   ls -la *.tfvars*
   # Should only see terraform.tfvars.example
   ```

## Required Configuration Before Deployment

### 1. Backend Configuration

**Option A: Update main.tf** (if committing backend config)
```hcl
backend "s3" {
  bucket         = "your-actual-bucket-name"
  key            = "auction-intelligence-mesh/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "your-actual-locks-table"
}
```

**Option B: Use backend.hcl** (recommended - not committed)
```bash
cp backend.hcl.example backend.hcl
# Edit backend.hcl with your values
terraform init -backend-config=backend.hcl
```

**Option C: Use CLI flags** (for CI/CD)
```bash
terraform init \
  -backend-config="bucket=your-bucket" \
  -backend-config="key=path/to/state" \
  -backend-config="region=us-east-1" \
  -backend-config="dynamodb_table=your-table"
```

### 2. Variables Configuration

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual values
# NEVER commit terraform.tfvars
```

### 3. Create Required AWS Resources

Before running `terraform init`, create:

1. **S3 Bucket for State**:
   ```bash
   aws s3 mb s3://your-terraform-state-bucket --region us-east-1
   aws s3api put-bucket-versioning \
     --bucket your-terraform-state-bucket \
     --versioning-configuration Status=Enabled
   aws s3api put-bucket-encryption \
     --bucket your-terraform-state-bucket \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

2. **DynamoDB Table for Locks**:
   ```bash
   aws dynamodb create-table \
     --table-name your-terraform-locks-table \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

## Security Best Practices

### ✅ DO

- Use `terraform.tfvars.example` as a template
- Store secrets in AWS Secrets Manager
- Use IAM roles instead of access keys
- Enable encryption on S3 buckets
- Use versioning on state bucket
- Review all changes before committing
- Use branch protection rules
- Require PR reviews for infrastructure changes

### ❌ DON'T

- Commit `.tfvars` files with real values
- Commit `.tfstate` files
- Hardcode passwords or API keys
- Share state files via email or chat
- Use root AWS credentials
- Disable encryption
- Skip security reviews

## Git Hooks (Optional but Recommended)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Prevent committing sensitive files

FORBIDDEN_FILES=(
  "terraform.tfvars"
  "*.tfstate"
  "*.tfstate.*"
  "backend.hcl"
  ".env"
)

for file in "${FORBIDDEN_FILES[@]}"; do
  if git diff --cached --name-only | grep -q "$file"; then
    echo "❌ ERROR: Attempting to commit forbidden file: $file"
    echo "   This file may contain sensitive information."
    exit 1
  fi
done

# Check for hardcoded secrets
if git diff --cached | grep -iE "(password|secret|key|token)\s*=\s*['\"][^'\"]+['\"]"; then
  echo "⚠️  WARNING: Potential hardcoded secret detected"
  echo "   Please review before committing"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Verification Commands

Before pushing:

```bash
# 1. Check what will be committed
git status

# 2. Review changes
git diff --cached

# 3. Verify no secrets
grep -r "password\|secret" --include="*.tf" --exclude-dir=".terraform" .

# 4. Test Terraform validate
terraform validate

# 5. Test Terraform plan (if backend configured)
terraform plan
```

## Emergency: If You Accidentally Committed Secrets

1. **Immediately rotate secrets**:
   - Change all passwords
   - Rotate API keys
   - Regenerate certificates

2. **Remove from Git history**:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch terraform.tfvars" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push** (coordinate with team):
   ```bash
   git push origin --force --all
   ```

4. **Notify team** about secret rotation

## Checklist Summary

Before every commit:
- [ ] No `.tfvars` files staged
- [ ] No `.tfstate` files staged
- [ ] No `.env` files staged
- [ ] No hardcoded secrets in code
- [ ] Backend configured properly
- [ ] `.gitignore` is working
- [ ] Variables use example file
- [ ] Documentation updated if needed

---

**Remember**: When in doubt, don't commit. Review with the team first.
