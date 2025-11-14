#!/bin/bash
# Link Supabase project and verify Pulse Dashboard setup
# This script helps connect to your Supabase project and verify Pulse tables

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔗 Supabase Project Link & Setup${NC}\n"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ Supabase CLI not found${NC}"
  echo -e "${YELLOW}Install: npm install -g supabase${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}\n"

# Check if already linked
if supabase status &> /dev/null || [ -f "supabase/.temp/project-ref" ]; then
  echo -e "${GREEN}✅ Project already linked${NC}"
  PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || supabase status 2>/dev/null | grep "Project ID" | awk '{print $3}' || echo "")
  if [ -n "$PROJECT_REF" ]; then
    echo -e "${YELLOW}Project Ref: $PROJECT_REF${NC}\n"
  fi
else
  echo -e "${YELLOW}Not linked to a project${NC}\n"
  echo -e "${YELLOW}To link:${NC}"
  echo -e "  1. Get your project ref from: https://supabase.com/dashboard"
  echo -e "  2. Run: ${GREEN}supabase link --project-ref [YOUR_PROJECT_REF]${NC}"
  echo -e "  3. Or provide it now:${NC}"
  read -p "Project Ref (or press Enter to skip): " PROJECT_REF
  
  if [ -n "$PROJECT_REF" ]; then
    echo -e "${YELLOW}Linking to project: $PROJECT_REF${NC}"
    supabase link --project-ref "$PROJECT_REF" || {
      echo -e "${RED}❌ Failed to link. Check your project ref and try again.${NC}"
      exit 1
    }
    echo -e "${GREEN}✅ Project linked successfully${NC}\n"
  else
    echo -e "${YELLOW}⚠️  Skipping link. You can link later with:${NC}"
    echo -e "  ${GREEN}supabase link --project-ref [PROJECT_REF]${NC}\n"
  fi
fi

# Check Pulse migrations
echo -e "${YELLOW}Checking Pulse migrations...${NC}"
PULSE_MIGRATIONS=(
  "supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql"
  "supabase/migrations/20251112_pulse_decision_inbox.sql"
)

for migration in "${PULSE_MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo -e "${GREEN}✅ $(basename $migration)${NC}"
  else
    echo -e "${RED}❌ Missing: $(basename $migration)${NC}"
  fi
done

# Check database connection
echo -e "\n${YELLOW}Checking database connection...${NC}"
if supabase status &> /dev/null; then
  echo -e "${GREEN}✅ Connected to Supabase${NC}"
  
  # Check if Pulse tables exist
  echo -e "\n${YELLOW}Checking Pulse tables...${NC}"
  TABLES=$(supabase db execute "
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('pulse_cards', 'pulse_threads', 'pulse_digest', 'pulse_mutes')
    ORDER BY table_name;
  " 2>/dev/null || echo "")
  
  if [ -n "$TABLES" ]; then
    echo "$TABLES" | grep -v "table_name" | while read -r table; do
      if [ -n "$table" ]; then
        echo -e "${GREEN}✅ Table exists: $table${NC}"
      fi
    done
  else
    echo -e "${YELLOW}⚠️  Could not check tables (may need to apply migrations)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Cannot connect to database${NC}"
  echo -e "${YELLOW}Options:${NC}"
  echo -e "  1. Link project: ${GREEN}supabase link --project-ref [PROJECT_REF]${NC}"
  echo -e "  2. Start local: ${GREEN}supabase start${NC} (requires Docker)"
fi

# Migration options
echo -e "\n${YELLOW}Migration Options:${NC}"
echo -e "  1. Push all migrations: ${GREEN}supabase db push${NC}"
echo -e "  2. Apply specific migration: ${GREEN}supabase db execute -f [MIGRATION_FILE]${NC}"
echo -e "  3. Use Supabase Dashboard SQL Editor (recommended for production)"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup check complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

