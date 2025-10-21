#!/bin/bash

# Quick Migration Runner for Google Policy Compliance
# This script makes it easy to run the database migration

set -e

PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null)

if [ -z "$PROJECT_REF" ]; then
  echo "❌ Error: Could not find Supabase project reference"
  exit 1
fi

echo "🚀 Google Policy Compliance - Quick Migration"
echo "=============================================="
echo "Project: $PROJECT_REF"
echo ""

# Method 1: Using psql (if password is available)
if command -v psql &> /dev/null; then
  echo "✅ psql is available"
  echo ""
  echo "Enter your Supabase database password:"
  echo "(Find it at: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database)"
  echo ""
  read -s -p "Password: " DB_PASSWORD
  echo ""
  echo ""

  if [ -n "$DB_PASSWORD" ]; then
    echo "📦 Running migration via psql..."

    # Construct pooler connection string
    POOLER_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres"

    PGPASSWORD="$DB_PASSWORD" psql "$POOLER_URL" -f supabase/migrations/20251020_google_policy_compliance.sql

    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ Migration completed successfully!"
      echo ""
      echo "Verifying tables..."
      PGPASSWORD="$DB_PASSWORD" psql "$POOLER_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'google_policy%';"

      echo ""
      echo "🎉 Setup complete! Next steps:"
      echo "  1. Test locally: npm run dev"
      echo "  2. Test API: curl http://localhost:3000/api/compliance/google-pricing/summary"
      echo "  3. View dashboard: http://localhost:3000/intelligence"
    else
      echo ""
      echo "❌ Migration failed. Check the error message above."
      exit 1
    fi
  else
    echo "⚠️  No password provided. Using alternate method..."
  fi
else
  echo "⚠️  psql not found. Using alternate method..."
fi

# Method 2: Copy to clipboard and open SQL editor
echo ""
echo "📋 Alternative: Manual SQL Editor Method"
echo "========================================="
echo ""
echo "1. Opening Supabase SQL Editor in your browser..."
open "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo ""
echo "2. Copying migration SQL to clipboard..."
cat supabase/migrations/20251020_google_policy_compliance.sql | pbcopy

echo ""
echo "✅ SQL copied to clipboard!"
echo ""
echo "📝 Next steps:"
echo "  1. SQL editor should be open in your browser"
echo "  2. Paste (Cmd+V) the SQL"
echo "  3. Click 'Run'"
echo "  4. You should see: 'Google Policy Compliance schema created successfully!'"
echo ""
echo "Then come back here and press Enter to verify..."
read -p "Press Enter after running the migration in SQL editor..."

echo ""
echo "🔍 To verify the migration worked, run:"
echo "  cat > /tmp/verify.sql << 'EOF'
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'google_policy%';
EOF"
echo ""
echo "Then paste and run that in SQL editor. You should see 4 tables."
