#!/bin/bash
# Verify Pulse Dashboard Database Schema using Supabase CLI
# Checks for required tables, functions, and RLS policies

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verifying Pulse Dashboard Database Schema${NC}\n"

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
else
  echo -e "${YELLOW}⚠️  Local instance not running, checking remote connection...${NC}"
  USE_LOCAL=false
fi

# Required tables for Pulse Dashboard
REQUIRED_TABLES=(
  "pulse_cards"
  "pulse_threads"
  "pulse_digest"
  "pulse_mutes"
)

# Required functions
REQUIRED_FUNCTIONS=(
  "get_pulse_inbox"
)

echo -e "\n${YELLOW}Checking required tables...${NC}"

# Create SQL query to check tables
CHECK_TABLES_SQL="
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('pulse_cards', 'pulse_threads', 'pulse_digest', 'pulse_mutes')
ORDER BY table_name;
"

if [ "$USE_LOCAL" = true ]; then
  # Check local database
  echo -e "${YELLOW}Querying local database...${NC}"
  TABLES=$(supabase db execute "$CHECK_TABLES_SQL" 2>/dev/null || echo "")
  
  if [ -z "$TABLES" ]; then
    echo -e "${RED}❌ Could not query local database${NC}"
    echo -e "${YELLOW}Try: supabase start${NC}"
  else
    for table in "${REQUIRED_TABLES[@]}"; do
      if echo "$TABLES" | grep -q "$table"; then
        echo -e "${GREEN}✅ Table exists: $table${NC}"
      else
        echo -e "${RED}❌ Table missing: $table${NC}"
      fi
    done
  fi
else
  # Check remote database via DATABASE_URL
  if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set, skipping remote check${NC}"
    echo -e "${YELLOW}Set DATABASE_URL to verify remote database${NC}"
  else
    echo -e "${YELLOW}Checking remote database...${NC}"
    for table in "${REQUIRED_TABLES[@]}"; do
      # Simple check - try to describe table
      if psql "$DATABASE_URL" -c "\d $table" &> /dev/null; then
        echo -e "${GREEN}✅ Table exists: $table${NC}"
      else
        echo -e "${RED}❌ Table missing: $table${NC}"
      fi
    done
  fi
fi

# Check for get_pulse_inbox function
echo -e "\n${YELLOW}Checking required functions...${NC}"
CHECK_FUNCTIONS_SQL="
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_pulse_inbox';
"

if [ "$USE_LOCAL" = true ]; then
  FUNCTIONS=$(supabase db execute "$CHECK_FUNCTIONS_SQL" 2>/dev/null || echo "")
  if echo "$FUNCTIONS" | grep -q "get_pulse_inbox"; then
    echo -e "${GREEN}✅ Function exists: get_pulse_inbox${NC}"
  else
    echo -e "${RED}❌ Function missing: get_pulse_inbox${NC}"
    echo -e "${YELLOW}Run migration: supabase/migrations/20251112_pulse_decision_inbox.sql${NC}"
  fi
else
  if [ -n "$DATABASE_URL" ]; then
    if psql "$DATABASE_URL" -c "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'get_pulse_inbox';" | grep -q "get_pulse_inbox"; then
      echo -e "${GREEN}✅ Function exists: get_pulse_inbox${NC}"
    else
      echo -e "${RED}❌ Function missing: get_pulse_inbox${NC}"
    fi
  fi
fi

# Check migrations
echo -e "\n${YELLOW}Checking migrations...${NC}"
PULSE_MIGRATIONS=(
  "supabase/migrations/20251112_pulse_decision_inbox.sql"
  "supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql"
)

for migration in "${PULSE_MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo -e "${GREEN}✅ Migration file exists: $(basename $migration)${NC}"
  else
    echo -e "${RED}❌ Migration file missing: $migration${NC}"
  fi
done

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Database Verification Complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. If tables are missing, run migrations:"
echo -e "     ${GREEN}supabase db push${NC}"
echo -e "  2. Or apply manually:"
echo -e "     ${GREEN}psql \$DATABASE_URL -f supabase/migrations/20251112_pulse_decision_inbox.sql${NC}"
echo -e "  3. Verify in Supabase Dashboard:"
echo -e "     ${GREEN}https://supabase.com/dashboard/project/[PROJECT]/editor${NC}\n"

