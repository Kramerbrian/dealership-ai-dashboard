# Git Repository Migration Guide

This guide explains how to add the AIM infrastructure code to a different repository.

## Option 1: Add to Existing Repository (Recommended)

If you have an existing repository where you want to add this infrastructure:

### Step 1: Navigate to Your Repository

```bash
cd /path/to/your/repository
```

### Step 2: Add Infrastructure Directory

```bash
# Copy the infrastructure directory
cp -r /workspace/infrastructure ./infrastructure

# Or if you want to keep it in a subdirectory
mkdir -p terraform/aim
cp -r /workspace/infrastructure/terraform/* ./terraform/aim/
```

### Step 3: Stage and Commit

```bash
git add infrastructure/
# or
git add terraform/aim/

git commit -m "Add Auction Intelligence Mesh Terraform infrastructure"
git push origin main
```

## Option 2: Initialize New Repository

If you want to create a dedicated infrastructure repository:

### Step 1: Create New Repository

```bash
# On GitHub/GitLab, create a new repository
# Then locally:
mkdir aim-infrastructure
cd aim-infrastructure
git init
```

### Step 2: Copy Infrastructure Code

```bash
# Copy all infrastructure files
cp -r /workspace/infrastructure/terraform/* .

# Or copy the entire infrastructure directory
cp -r /workspace/infrastructure .
```

### Step 3: Initialize Git and Push

```bash
git add .
git commit -m "Initial commit: AIM Terraform infrastructure"
git branch -M main
git remote add origin https://github.com/your-org/aim-infrastructure.git
git push -u origin main
```

## Option 3: Use Git Subtree (For Monorepo)

If you want to keep infrastructure in a monorepo but track it separately:

### Step 1: Add as Subtree

```bash
cd /path/to/your/monorepo
git subtree add --prefix=infrastructure/terraform \
  /workspace/infrastructure/terraform \
  main \
  --squash
```

### Step 2: Update Later

```bash
# To pull updates from the infrastructure repo
git subtree pull --prefix=infrastructure/terraform \
  https://github.com/your-org/aim-infrastructure.git \
  main \
  --squash
```

## Option 4: Use Git Submodule

If you want to reference the infrastructure as a separate repository:

### Step 1: Add Submodule

```bash
cd /path/to/your/repository
git submodule add https://github.com/your-org/aim-infrastructure.git infrastructure/terraform
git commit -m "Add AIM infrastructure as submodule"
```

### Step 2: Clone Repository with Submodules

```bash
# When cloning your main repo, include submodules
git clone --recurse-submodules https://github.com/your-org/main-repo.git

# Or if already cloned
git submodule update --init --recursive
```

## Option 5: Manual File Transfer

If you prefer to manually transfer files:

### Step 1: Create Archive

```bash
cd /workspace
tar -czf aim-infrastructure.tar.gz infrastructure/
# or
zip -r aim-infrastructure.zip infrastructure/
```

### Step 2: Transfer and Extract

```bash
# Upload to your repository
# Then extract:
tar -xzf aim-infrastructure.tar.gz
# or
unzip aim-infrastructure.zip
```

## Recommended Repository Structure

For a dedicated infrastructure repository:

```
aim-infrastructure/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── README.md
│   ├── terraform.tfvars.example
│   └── modules/
│       ├── vpc/
│       ├── security/
│       ├── eks/
│       └── ...
├── .gitignore
├── README.md
└── LICENSE
```

## Important Files to Include

Make sure these files are included:

- ✅ All `.tf` files
- ✅ `README.md` and documentation
- ✅ `.gitignore` (excludes `.tfstate`, `.tfvars`, etc.)
- ✅ Lambda code in `modules/api_gateway/lambda_code/`
- ✅ Schema initialization script `modules/redshift/schema_init.py`

## Files to Exclude (via .gitignore)

The `.gitignore` should exclude:

- `.tfstate` and `.tfstate.*` files
- `.tfvars` files (sensitive values)
- `.terraform/` directory
- `*.zip` files (Lambda packages)
- `/tmp/` directory

## Setting Up CI/CD

After adding to repository, you can set up CI/CD:

### GitHub Actions Example

Create `.github/workflows/terraform.yml`:

```yaml
name: Terraform

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/terraform/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v2
      - name: Terraform Init
        run: terraform init
        working-directory: infrastructure/terraform
      - name: Terraform Validate
        run: terraform validate
        working-directory: infrastructure/terraform
      - name: Terraform Plan
        run: terraform plan
        working-directory: infrastructure/terraform
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Security Considerations

1. **Never commit**:
   - `terraform.tfvars` with real passwords
   - `.tfstate` files
   - AWS credentials

2. **Use secrets management**:
   - GitHub Secrets for CI/CD
   - AWS Secrets Manager for runtime
   - Terraform Cloud/Enterprise for state

3. **Review** `.gitignore` before committing

## Quick Copy Script

Here's a script to quickly copy to a new location:

```bash
#!/bin/bash
# copy-infrastructure.sh

SOURCE="/workspace/infrastructure"
DEST="$1"

if [ -z "$DEST" ]; then
  echo "Usage: $0 <destination-path>"
  exit 1
fi

echo "Copying infrastructure to $DEST..."
mkdir -p "$DEST"
cp -r "$SOURCE" "$DEST/"

echo "✅ Infrastructure copied successfully!"
echo "Next steps:"
echo "  cd $DEST/infrastructure/terraform"
echo "  git init  # if new repo"
echo "  git add ."
echo "  git commit -m 'Add AIM infrastructure'"
```

## Verification

After copying, verify the structure:

```bash
# Check all modules exist
ls -la infrastructure/terraform/modules/

# Verify key files
test -f infrastructure/terraform/main.tf && echo "✅ main.tf exists"
test -f infrastructure/terraform/README.md && echo "✅ README.md exists"
test -d infrastructure/terraform/modules/vpc && echo "✅ VPC module exists"
test -d infrastructure/terraform/modules/security && echo "✅ Security module exists"
```

## Next Steps After Migration

1. Update `main.tf` backend configuration for your S3 bucket
2. Create `terraform.tfvars` with your values
3. Review and customize module configurations
4. Set up CI/CD pipeline
5. Initialize Terraform: `terraform init`
6. Plan deployment: `terraform plan`

---

**Note**: Always review sensitive values and update `.gitignore` before committing to a public repository.
