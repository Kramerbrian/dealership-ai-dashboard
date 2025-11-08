# Migrate Infrastructure to GitHub Repository

## Step 1: Create or Access Repository

If the repository doesn't exist, create it first:
1. Go to https://github.com/Kramerbrian/AppraiseYourVehicle
2. Click "New repository" if it doesn't exist
3. Initialize with README (optional)

## Step 2: Clone Repository

```bash
cd /tmp
git clone https://github.com/Kramerbrian/AppraiseYourVehicle.git
cd AppraiseYourVehicle
```

## Step 3: Copy Infrastructure Files

```bash
# Copy infrastructure directory
cp -r /workspace/infrastructure ./infrastructure

# Or if you want it in a specific location
mkdir -p terraform/aim
cp -r /workspace/infrastructure/terraform/* ./terraform/aim/
```

## Step 4: Create .gitignore (if not exists)

```bash
cat >> .gitignore << 'EOF'
# Terraform
*.tfstate
*.tfstate.*
*.tfvars
.terraform/
.terraform.lock.hcl
crash.log
override.tf
override.tf.json
*_override.tf
*_override.tf.json

# Lambda packages
*.zip
/tmp/

# IDE
.idea/
.vscode/
*.swp
*.swo
EOF
```

## Step 5: Commit and Push

```bash
git add infrastructure/
# or
git add terraform/aim/

git commit -m "Add Auction Intelligence Mesh Terraform infrastructure"
git push origin main
```

## Alternative: Use Migration Script

Run the automated script:

```bash
bash /workspace/infrastructure/migrate-to-github.sh
```
