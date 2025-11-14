#!/bin/bash
# Apply orchestrator telemetry migration using Supabase CLI
# Usage: ./scripts/apply-telemetry-migration.sh [--local|--remote]

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MIGRATION_FILE="supabase/migrations/20250120000000_orchestrator_telemetry_365day_retention.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}📋 Applying orchestrator telemetry migration...${NC}"

# Check if using local or remote
if [ "$1" == "--local" ]; then
  echo -e "${YELLOW}Using local Supabase instance...${NC}"
  
  # Check if local Supabase is running
  if ! supabase status > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting local Supabase...${NC}"
    supabase start
  fi
  
  # Apply migration to local
  supabase db reset --db-url "$(supabase status --output json | jq -r '.DB_URL')" || {
    echo -e "${YELLOW}Note: Using direct migration apply...${NC}"
    supabase migration up
  }
  
elif [ "$1" == "--remote" ] || [ -n "$DATABASE_URL" ]; then
  echo -e "${YELLOW}Using remote Supabase instance...${NC}"
  
  if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set. Please set it or use --local${NC}"
    exit 1
  fi
  
  # Apply migration to remote
  supabase db push --db-url "$DATABASE_URL" || {
    echo -e "${YELLOW}Alternative: Apply migration directly...${NC}"
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
  }
  
else
  echo -e "${YELLOW}No target specified. Checking for local Supabase...${NC}"
  
  if supabase status > /dev/null 2>&1; then
    echo -e "${GREEN}Local Supabase detected. Applying to local...${NC}"
    supabase migration up
  elif [ -n "$DATABASE_URL" ]; then
    echo -e "${GREEN}DATABASE_URL found. Applying to remote...${NC}"
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
  else
    echo -e "${RED}❌ No Supabase instance found. Please:${NC}"
    echo -e "  1. Start local: ${YELLOW}supabase start${NC}"
    echo -e "  2. Or set DATABASE_URL and use: ${YELLOW}./scripts/apply-telemetry-migration.sh --remote${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Migration applied successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Start dev server: ${GREEN}npm run dev${NC}"
echo -e "  2. Test endpoints: ${GREEN}./scripts/test-endpoints.sh${NC}"
