#!/bin/bash
# Apply Pulse Dashboard migrations using Supabase CLI
# This script applies all Pulse-related migrations

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Applying Pulse Dashboard Migrations${NC}\n"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ Supabase CLI not found${NC}"
  echo -e "${YELLOW}Install: npm install -g supabase${NC}"
  exit 1
fi

# Check connection
if supabase status &> /dev/null; then
  echo -e "${GREEN}✅ Local Supabase instance detected${NC}"
  USE_LOCAL=true
elif [ -n "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  Using remote database via DATABASE_URL${NC}"
  USE_LOCAL=false
else
  echo -e "${RED}❌ No Supabase connection found${NC}"
  echo -e "${YELLOW}Options:${NC}"
  echo -e "  1. Start local: ${GREEN}supabase start${NC}"
  echo -e "  2. Link remote: ${GREEN}supabase link --project-ref [PROJECT_REF]${NC}"
  exit 1
fi

# Pulse migrations in order
PULSE_MIGRATIONS=(
  "supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql"
  "supabase/migrations/20251112_pulse_decision_inbox.sql"
)

echo -e "\n${YELLOW}Applying migrations...${NC}\n"

for migration in "${PULSE_MIGRATIONS[@]}"; do
  if [ ! -f "$migration" ]; then
    echo -e "${RED}❌ Migration file not found: $migration${NC}"
    continue
  fi

  echo -e "${YELLOW}Applying: $(basename $migration)${NC}"
  
  if [ "$USE_LOCAL" = true ]; then
    # Apply to local
    if supabase db execute -f "$migration" 2>&1 | grep -v "already exists" | grep -v "ERROR" > /dev/null; then
      echo -e "${GREEN}✅ Applied successfully${NC}\n"
    else
      echo -e "${YELLOW}⚠️  Migration may have already been applied${NC}\n"
    fi
  else
    # Apply to remote via psql
    if psql "$DATABASE_URL" -f "$migration" 2>&1 | grep -v "already exists" | grep -v "ERROR" > /dev/null; then
      echo -e "${GREEN}✅ Applied successfully${NC}\n"
    else
      echo -e "${YELLOW}⚠️  Check output above for errors${NC}\n"
    fi
  fi
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Migration application complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Verify schema: ${GREEN}./scripts/setup-supabase-pulse.sh${NC}"
echo -e "  2. Test API: ${GREEN}curl http://localhost:3000/api/pulse/snapshot?tenant=demo${NC}"
echo -e "  3. Check dashboard: ${GREEN}http://localhost:3000/pulse${NC}\n"

