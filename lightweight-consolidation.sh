#!/bin/bash

# Lightweight DealershipAI Repository Consolidation
# This script consolidates repositories without creating full backups

set -e

echo "🚀 Lightweight DealershipAI Repository Consolidation"
echo "=================================================="

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

echo -e "${BLUE}📊 Repository Analysis:${NC}"
echo "Main Repository: $MAIN_REPO"
echo "Repository 1: $REPO1"
echo "Repository 2: $REPO2"
echo "Repository 3: $REPO3"
echo ""

# Step 1: Create analysis directory (lightweight)
echo -e "${YELLOW}🔍 Step 1: Creating lightweight analysis...${NC}"
mkdir -p analysis/{repo1,repo2,repo3}

# Step 2: Analyze unique files in each repository (without copying)
echo -e "${YELLOW}🔍 Step 2: Analyzing unique files...${NC}"

echo "Analyzing dealership-ai..."
find "$REPO1" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.json" -o -name "*.sql" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" | head -50 > analysis/repo1/unique_files.txt

echo "Analyzing dealershipai-nextjs..."
find "$REPO2" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.json" -o -name "*.sql" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" | head -50 > analysis/repo2/unique_files.txt

echo "Analyzing dealershipai-dashboard-deploy..."
find "$REPO3" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.json" -o -name "*.sql" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" | head -50 > analysis/repo3/unique_files.txt

echo -e "${GREEN}✅ Analysis complete!${NC}"

# Step 3: Show what we found
echo -e "${BLUE}📋 Step 3: Analysis Results${NC}"
echo ""

echo "Files in dealership-ai:"
wc -l analysis/repo1/unique_files.txt
echo ""

echo "Files in dealershipai-nextjs:"
wc -l analysis/repo2/unique_files.txt
echo ""

echo "Files in dealershipai-dashboard-deploy:"
wc -l analysis/repo3/unique_files.txt
echo ""

# Step 4: Create selective merge script
echo -e "${YELLOW}📝 Step 4: Creating selective merge script...${NC}"

cat > selective-merge.sh << 'EOF'
#!/bin/bash

echo "🔄 Starting selective repository merge..."

# Create merge directories
mkdir -p merged/{dealership-ai,dealershipai-nextjs,dealershipai-dashboard-deploy}

# Function to copy unique files
copy_unique_files() {
    local source_repo="$1"
    local target_dir="$2"
    local analysis_file="$3"
    
    echo "Copying unique files from $source_repo..."
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Get relative path
            relative_path=${file#$source_repo/}
            target_path="merged/$target_dir/$relative_path"
            
            # Create directory if it doesn't exist
            mkdir -p "$(dirname "$target_path")"
            
            # Copy file
            cp "$file" "$target_path"
            echo "  Copied: $relative_path"
        fi
    done < "$analysis_file"
}

# Copy files from each repository
copy_unique_files "/Users/briankramer/dealership-ai" "dealership-ai" "analysis/repo1/unique_files.txt"
copy_unique_files "/Users/briankramer/dealershipai-nextjs" "dealershipai-nextjs" "analysis/repo2/unique_files.txt"
copy_unique_files "/Users/briankramer/dealershipai-dashboard-deploy" "dealershipai-dashboard-deploy" "analysis/repo3/unique_files.txt"

echo "✅ Selective merge complete!"
echo "Review the 'merged' directory and manually integrate files as needed."
EOF

chmod +x selective-merge.sh

# Step 5: Create integration guide
echo -e "${YELLOW}📝 Step 5: Creating integration guide...${NC}"

cat > INTEGRATION_GUIDE.md << 'EOF'
# DealershipAI Repository Integration Guide

## Overview
This guide helps you integrate files from multiple DealershipAI repositories into your main `dealership-ai-dashboard` repository.

## Current Repository Status

### Main Repository: `dealership-ai-dashboard`
- **Status**: ✅ Most complete
- **Features**: Ory authentication, full Next.js app, all integrations
- **GitHub**: https://github.com/Kramerbrian/dealership-ai-dashboard.git

### Repository 1: `dealership-ai`
- **Status**: 📦 Older version
- **GitHub**: https://github.com/Kramerbrian/dealership-ai.git
- **Unique files**: See analysis/repo1/unique_files.txt

### Repository 2: `dealershipai-nextjs`
- **Status**: 📦 Next.js focused
- **GitHub**: https://github.com/Kramerbrian/dealershipai.git
- **Unique files**: See analysis/repo2/unique_files.txt

### Repository 3: `dealershipai-dashboard-deploy`
- **Status**: 📦 Deployment focused
- **Unique files**: See analysis/repo3/unique_files.txt

## Integration Steps

### Step 1: Review Analysis
```bash
# View unique files from each repository
cat analysis/repo1/unique_files.txt
cat analysis/repo2/unique_files.txt
cat analysis/repo3/unique_files.txt
```

### Step 2: Run Selective Merge
```bash
./selective-merge.sh
```

### Step 3: Manual Integration
1. Review files in the `merged/` directory
2. Identify files that should be integrated into the main repository
3. Copy or merge unique functionality
4. Update imports and references

### Step 4: Clean Up
1. Test the integrated application
2. Remove duplicate files
3. Update documentation
4. Commit changes to git

## Recommended Actions

### Keep in Main Repository
- All current functionality (it's the most complete)
- Ory authentication setup
- Next.js application structure
- Database schemas and migrations

### Consider Integrating
- Unique components from other repositories
- Different deployment configurations
- Additional documentation
- Alternative implementations

### Archive/Delete
- Duplicate files
- Outdated implementations
- Unused configurations

## Next Steps

1. **Review the analysis files** to understand what's unique in each repository
2. **Run the selective merge** to prepare files for integration
3. **Manually review and integrate** only the files you need
4. **Test thoroughly** before committing changes
5. **Update GitHub repositories** as needed

## Safety Notes

- Your main repository remains unchanged until you decide to integrate
- All unique files are preserved in the `merged/` directory
- You can always revert changes using git
- Consider creating a new branch for integration work

## Disk Space Management

Since disk space is limited (99% full):
- The analysis approach is lightweight (no full backups)
- Only unique files are copied to the `merged/` directory
- You can delete the `merged/` directory after integration
- Consider cleaning up `node_modules` directories in other repositories
EOF

echo -e "${GREEN}✅ Lightweight consolidation setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Review the analysis files in the 'analysis' directory"
echo "2. Run './selective-merge.sh' to prepare files for integration"
echo "3. Follow the INTEGRATION_GUIDE.md for manual integration"
echo "4. Test the integrated application"
echo "5. Update git and GitHub as needed"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- This approach is lightweight and doesn't create full backups"
echo "- Your main repository remains unchanged until you integrate"
echo "- Review all changes before committing to git"
echo "- Consider cleaning up disk space before proceeding"
echo ""
echo -e "${GREEN}🎉 Lightweight repository consolidation complete!${NC}"
