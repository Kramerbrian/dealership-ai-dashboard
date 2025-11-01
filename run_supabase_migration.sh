#!/bin/bash

# Run opportunities table migration using Supabase CLI
# This creates the table and performance index for cursor-based pagination

set -e

echo "🚀 Running Opportunities Table Migration"
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo "Install: brew install supabase/tap/supabase"
    exit 1
fi

# Check if linked to a project
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Not linked to a Supabase project"
    echo ""
    echo "Option 1: Link to remote project"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Option 2: Use Supabase Dashboard instead"
    echo "  1. Go to: https://supabase.com/dashboard"
    echo "  2. Select project → SQL Editor"
    echo "  3. Paste SQL from prisma/migrations/001_add_opportunities_table.sql"
    echo ""
    exit 1
fi

# SQL migration content
SQL_MIGRATION=$(cat << 'EOF'
-- Create opportunities table for cursor-based pagination
-- Migration: Add opportunities table with impact_score ordering

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
  "impactScore" DOUBLE PRECISION NOT NULL,
  priority INTEGER NOT NULL,
  "estimatedROI" DOUBLE PRECISION NOT NULL,
  "estimatedAIVGain" DOUBLE PRECISION NOT NULL,
  effort TEXT NOT NULL CHECK (effort IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Index for domain filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_domain ON opportunities(domain);

-- Performance index for cursor-based pagination (ORDER BY impactScore DESC, id DESC)
-- This is critical for efficient pagination queries
CREATE INDEX IF NOT EXISTS idx_opportunities_impact_id 
  ON opportunities("impactScore" DESC, id DESC);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);

-- Comment explaining the pagination index
COMMENT ON INDEX idx_opportunities_impact_id IS 
  'Supports cursor-based pagination queries ordering by impactScore DESC, id DESC';
EOF
)

echo "📋 Migration SQL:"
echo "$SQL_MIGRATION" | head -20
echo "..."
echo ""

# Execute via Supabase CLI
echo "▶️  Executing migration..."
echo ""

if supabase db execute --file - <<< "$SQL_MIGRATION" 2>&1; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🔍 Verifying index creation..."
    
    # Verify the index exists
    VERIFY_SQL="SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'opportunities' AND indexname = 'idx_opportunities_impact_id';"
    
    if supabase db execute <<< "$VERIFY_SQL" 2>&1 | grep -q "idx_opportunities_impact_id"; then
        echo "✅ Performance index 'idx_opportunities_impact_id' verified"
    else
        echo "⚠️  Could not verify index (this is OK if using remote project)"
    fi
    
    echo ""
    echo "🎉 Opportunities table and indexes created!"
    echo ""
    echo "Next steps:"
    echo "  1. Test API: curl 'https://your-deployment/api/opportunities?domain=example.com&limit=2'"
    echo "  2. Verify in Supabase Dashboard → Table Editor"
    
else
    echo ""
    echo "❌ Migration failed"
    echo ""
    echo "Alternative: Use Supabase Dashboard"
    echo "  1. Go to: https://supabase.com/dashboard"
    echo "  2. Select project → SQL Editor"
    echo "  3. Paste the SQL above"
    echo "  4. Click 'Run'"
    exit 1
fi

