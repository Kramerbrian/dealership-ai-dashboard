#!/bin/bash
# Setup monorepo structure for DealershipAI deployment
# This script creates apps/landing and apps/dashboard directories

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🏗️  Setting up DealershipAI monorepo structure...${NC}\n"

# Create directories
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p apps/landing/app
mkdir -p apps/dashboard/app
mkdir -p packages/ui

# Check if we should move files or create new structure
if [ -f "app/page.tsx" ]; then
  echo -e "${YELLOW}Found existing app structure. Creating symlinks for now...${NC}"
  echo -e "${YELLOW}Note: You may want to manually move files later.${NC}"
  
  # For now, create symlinks to avoid breaking existing structure
  # User can manually move files if they want full separation
  ln -sf ../../app/page.tsx apps/landing/app/page.tsx 2>/dev/null || echo "Symlink creation skipped"
else
  echo -e "${YELLOW}No existing app/page.tsx found. Will create new structure.${NC}"
fi

echo -e "${GREEN}✅ Directory structure created${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review the structure"
echo -e "  2. Move files manually if needed"
echo -e "  3. Create package.json files"
echo -e "  4. Configure Vercel projects"

