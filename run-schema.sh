#!/bin/bash

# Run DealershipAI Schema on Supabase
echo "Running DealershipAI Schema on Supabase..."
echo ""
echo "You'll be prompted for your Supabase database password."
echo "Find it in: Supabase Dashboard > Settings > Database > Connection String"
echo ""

echo -n "Enter your Supabase database password: "
read -s DB_PASSWORD
echo ""
echo ""

PGPASSWORD="$DB_PASSWORD" psql "postgresql://postgres.vxrdvkhkombwlhjvtsmw:$DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres" \
  -f supabase/migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schema successfully applied!"
else
    echo ""
    echo "❌ Error applying schema. Please check the error messages above."
fi
