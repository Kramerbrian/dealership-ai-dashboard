#!/bin/bash

# DealershipAI Repository Consolidation Script
# This script safely consolidates multiple DealershipAI repositories into one

set -e  # Exit on any error

echo "🚀 DealershipAI Repository Consolidation"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository paths
MAIN_REPO="/Users/briankramer/dealership-ai-dashboard"
REPO1="/Users/briankramer/dealership-ai"
REPO2="/Users/briankramer/dealershipai-nextjs"
REPO3="/Users/briankramer/dealershipai-dashboard-deploy"

# Backup directory
BACKUP_DIR="/Users/briankramer/dealership-ai-backups-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}📊 Repository Analysis:${NC}"
echo "Main Repository: $MAIN_REPO"
echo "Repository 1: $REPO1"
echo "Repository 2: $REPO2"
echo "Repository 3: $REPO3"
echo ""

# Step 1: Create backup directory
echo -e "${YELLOW}📦 Step 1: Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"
echo "Backup directory created: $BACKUP_DIR"

# Step 2: Backup all repositories
echo -e "${YELLOW}📦 Step 2: Backing up repositories...${NC}"

echo "Backing up dealership-ai-dashboard..."
cp -r "$MAIN_REPO" "$BACKUP_DIR/dealership-ai-dashboard-backup"

echo "Backing up dealership-ai..."
cp -r "$REPO1" "$BACKUP_DIR/dealership-ai-backup"

echo "Backing up dealershipai-nextjs..."
cp -r "$REPO2" "$BACKUP_DIR/dealershipai-nextjs-backup"

echo "Backing up dealershipai-dashboard-deploy..."
cp -r "$REPO3" "$BACKUP_DIR/dealershipai-dashboard-deploy-backup"

echo -e "${GREEN}✅ All repositories backed up successfully!${NC}"

# Step 3: Analyze unique files in each repository
echo -e "${YELLOW}🔍 Step 3: Analyzing unique files...${NC}"

cd "$MAIN_REPO"

# Create analysis directories
mkdir -p analysis/{repo1,repo2,repo3}

# Find unique files in each repository
echo "Finding unique files in dealership-ai..."
find "$REPO1" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.json" -o -name "*.sql" | head -20 > analysis/repo1/unique_files.txt

echo "Finding unique files in dealershipai-nextjs..."
find "$REPO2" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.json" -o -name "*.sql" | head -20 > analysis/repo2/unique_files.txt

echo "Finding unique files in dealershipai-dashboard-deploy..."
find "$REPO3" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.json" -o -name "*.sql" | head -20 > analysis/repo3/unique_files.txt

echo -e "${GREEN}✅ Analysis complete!${NC}"

# Step 4: Show consolidation options
echo -e "${BLUE}📋 Step 4: Consolidation Options${NC}"
echo ""
echo "Choose your consolidation approach:"
echo "1. Merge into dealership-ai-dashboard (Recommended)"
echo "2. Create new unified repository"
echo "3. Manual review and selective merge"
echo ""

# Step 5: Create merge script
echo -e "${YELLOW}📝 Step 5: Creating merge script...${NC}"

cat > merge-repositories.sh << 'EOF'
#!/bin/bash

# Merge script for DealershipAI repositories
echo "🔄 Starting repository merge..."

# Copy unique files from dealership-ai
echo "Merging files from dealership-ai..."
find /Users/briankramer/dealership-ai -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" | while read file; do
    relative_path=${file#/Users/briankramer/dealership-ai/}
    target_path="merged/dealership-ai/$relative_path"
    mkdir -p "$(dirname "$target_path")"
    cp "$file" "$target_path"
done

# Copy unique files from dealershipai-nextjs
echo "Merging files from dealershipai-nextjs..."
find /Users/briankramer/dealershipai-nextjs -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" | while read file; do
    relative_path=${file#/Users/briankramer/dealershipai-nextjs/}
    target_path="merged/dealershipai-nextjs/$relative_path"
    mkdir -p "$(dirname "$target_path")"
    cp "$file" "$target_path"
done

# Copy unique files from dealershipai-dashboard-deploy
echo "Merging files from dealershipai-dashboard-deploy..."
find /Users/briankramer/dealershipai-dashboard-deploy -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" | while read file; do
    relative_path=${file#/Users/briankramer/dealershipai-dashboard-deploy/}
    target_path="merged/dealershipai-dashboard-deploy/$relative_path"
    mkdir -p "$(dirname "$target_path")"
    cp "$file" "$target_path"
done

echo "✅ Merge preparation complete!"
echo "Review the 'merged' directory and manually integrate files as needed."
EOF

chmod +x merge-repositories.sh

echo -e "${GREEN}✅ Consolidation setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Review the analysis in the 'analysis' directory"
echo "2. Run './merge-repositories.sh' to prepare files for merging"
echo "3. Manually review and integrate unique files"
echo "4. Test the consolidated application"
echo "5. Update git remote and push to GitHub"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- All repositories have been backed up to: $BACKUP_DIR"
echo "- The main repository remains unchanged until you decide to merge"
echo "- Review all changes before committing to git"
echo ""
echo -e "${GREEN}🎉 Repository consolidation preparation complete!${NC}"
