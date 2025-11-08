#!/bin/bash
# Script to migrate AIM infrastructure to GitHub repository

set -e

REPO_URL="https://github.com/Kramerbrian/AppraiseYourVehicle.git"
REPO_NAME="AppraiseYourVehicle"
SOURCE_DIR="/workspace/infrastructure"
TEMP_DIR="/tmp/git-migration"

echo "🚀 Migrating AIM infrastructure to GitHub..."
echo "   Repository: $REPO_URL"
echo ""

# Clean up temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Try to clone repository
echo "📥 Cloning repository..."
if git clone "$REPO_URL" "$REPO_NAME" 2>/dev/null; then
  echo "   ✅ Repository cloned successfully"
  cd "$REPO_NAME"
else
  echo "   ⚠️  Repository not found or requires authentication"
  echo ""
  echo "   Please either:"
  echo "   1. Create the repository at https://github.com/Kramerbrian/AppraiseYourVehicle"
  echo "   2. Or provide authentication via:"
  echo "      git config --global credential.helper store"
  echo "      # Then enter your GitHub credentials when prompted"
  echo ""
  echo "   After setting up, run this script again."
  exit 1
fi

# Create infrastructure directory structure
echo "📋 Copying infrastructure files..."
mkdir -p infrastructure/terraform
cp -r "$SOURCE_DIR/terraform"/* ./infrastructure/terraform/

# Create or update .gitignore
echo "📝 Updating .gitignore..."
if [ ! -f .gitignore ]; then
  cat > .gitignore << 'EOF'
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

# Environment files
.env
.env.local
EOF
else
  # Append if .gitignore exists
  if ! grep -q "*.tfstate" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# Terraform
*.tfstate
*.tfstate.*
*.tfvars
.terraform/
EOF
  fi
fi

# Check git status
echo "📊 Checking changes..."
git status

# Stage files
echo "📦 Staging files..."
git add infrastructure/ .gitignore

# Check if there are changes
if git diff --staged --quiet; then
  echo "   ℹ️  No changes to commit (files may already be committed)"
else
  # Commit
  echo "💾 Committing changes..."
  git commit -m "Add Auction Intelligence Mesh Terraform infrastructure

- Complete AWS infrastructure as code
- EKS, MSK, Redshift, SageMaker, Bedrock modules
- API Gateway with Lambda functions
- Compliance and security configurations
- Full documentation and deployment guides"

  # Push
  echo "🚀 Pushing to GitHub..."
  git push origin main || git push origin master
  
  echo ""
  echo "✅ Migration complete!"
  echo "   View at: https://github.com/Kramerbrian/AppraiseYourVehicle"
fi

echo ""
echo "📁 Files copied to: $TEMP_DIR/$REPO_NAME"
echo "   You can review before pushing if needed."
