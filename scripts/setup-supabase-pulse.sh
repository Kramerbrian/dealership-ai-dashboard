#!/bin/bash
# Setup Supabase for Pulse Dashboard using Supabase CLI
# This script verifies and applies Pulse-related migrations

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗄️  Supabase Pulse Dashboard Setup${NC}\n"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ Supabase CLI not found${NC}"
  echo -e "${YELLOW}Install: npm install -g supabase${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}\n"

# Check connection
echo -e "${YELLOW}Checking Supabase connection...${NC}"
if supabase status &> /dev/null; then
  echo -e "${GREEN}✅ Local Supabase instance detected${NC}"
  USE_LOCAL=true
  SUPABASE_STATUS=$(supabase status 2>/dev/null | head -n 20)
  echo "$SUPABASE_STATUS"
elif [ -n "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  Using remote database via DATABASE_URL${NC}"
  USE_LOCAL=false
else
  echo -e "${YELLOW}⚠️  No local instance and DATABASE_URL not set${NC}"
  echo -e "${YELLOW}Options:${NC}"
  echo -e "  1. Start local: ${GREEN}supabase start${NC}"
  echo -e "  2. Link remote: ${GREEN}supabase link --project-ref [PROJECT_REF]${NC}"
  echo -e "  3. Set DATABASE_URL environment variable"
  USE_LOCAL=false
fi

# Check for Pulse migrations
echo -e "\n${YELLOW}Checking Pulse migrations...${NC}"
PULSE_MIGRATIONS=(
  "supabase/migrations/20251112_pulse_decision_inbox.sql"
  "supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql"
)

MIGRATIONS_FOUND=0
for migration in "${PULSE_MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo -e "${GREEN}✅ Found: $(basename $migration)${NC}"
    ((MIGRATIONS_FOUND++))
  else
    echo -e "${RED}❌ Missing: $migration${NC}"
  fi
done

if [ $MIGRATIONS_FOUND -eq 0 ]; then
  echo -e "${RED}❌ No Pulse migrations found${NC}"
  exit 1
fi

# Check if tables exist
echo -e "\n${YELLOW}Checking Pulse tables...${NC}"
if [ "$USE_LOCAL" = true ]; then
  # Check local database
  TABLES_CHECK=$(supabase db execute "
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('pulse_cards', 'pulse_threads', 'pulse_digest', 'pulse_mutes')
    ORDER BY table_name;
  " 2>/dev/null || echo "")
  
  if [ -n "$TABLES_CHECK" ]; then
    echo "$TABLES_CHECK" | while read -r table; do
      if [ -n "$table" ] && [ "$table" != "table_name" ]; then
        echo -e "${GREEN}✅ Table exists: $table${NC}"
      fi
    done
  else
    echo -e "${YELLOW}⚠️  Could not check tables (may need to apply migrations)${NC}"
  fi
else
  if [ -n "$DATABASE_URL" ]; then
    # Check remote database
    for table in "pulse_cards" "pulse_threads" "pulse_digest" "pulse_mutes"; do
      if psql "$DATABASE_URL" -c "\d $table" &> /dev/null; then
        echo -e "${GREEN}✅ Table exists: $table${NC}"
      else
        echo -e "${RED}❌ Table missing: $table${NC}"
      fi
    done
  fi
fi

# Check for get_pulse_inbox function
echo -e "\n${YELLOW}Checking Pulse functions...${NC}"
if [ "$USE_LOCAL" = true ]; then
  FUNCTIONS_CHECK=$(supabase db execute "
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
      AND routine_name IN ('get_pulse_inbox', 'ingest_pulse_card');
  " 2>/dev/null || echo "")
  
  if echo "$FUNCTIONS_CHECK" | grep -q "get_pulse_inbox"; then
    echo -e "${GREEN}✅ Function exists: get_pulse_inbox${NC}"
  else
    echo -e "${RED}❌ Function missing: get_pulse_inbox${NC}"
  fi
  
  if echo "$FUNCTIONS_CHECK" | grep -q "ingest_pulse_card"; then
    echo -e "${GREEN}✅ Function exists: ingest_pulse_card${NC}"
  else
    echo -e "${YELLOW}⚠️  Function missing: ingest_pulse_card (optional)${NC}"
  fi
fi

# Apply migrations if needed
echo -e "\n${YELLOW}Migration Status:${NC}"
if [ "$USE_LOCAL" = true ]; then
  echo -e "${YELLOW}To apply migrations to local:${NC}"
  echo -e "  ${GREEN}supabase db reset${NC} (resets and applies all)"
  echo -e "  ${GREEN}supabase migration up${NC} (applies pending)"
elif [ -n "$DATABASE_URL" ]; then
  echo -e "${YELLOW}To apply migrations to remote:${NC}"
  echo -e "  ${GREEN}supabase db push${NC} (if linked)"
  echo -e "  ${GREEN}psql \$DATABASE_URL -f supabase/migrations/20251112_pulse_decision_inbox.sql${NC}"
else
  echo -e "${YELLOW}Link to project first:${NC}"
  echo -e "  ${GREEN}supabase link --project-ref [PROJECT_REF]${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Supabase Pulse setup check complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Apply migrations if needed"
echo -e "  2. Verify tables exist"
echo -e "  3. Test Pulse API: ${GREEN}curl http://localhost:3000/api/pulse/snapshot?tenant=demo${NC}"
echo -e "  4. Check dashboard: ${GREEN}http://localhost:3000/pulse${NC}\n"

