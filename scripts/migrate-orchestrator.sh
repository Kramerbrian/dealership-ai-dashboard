#!/bin/bash

# Run Prisma migration for OrchestratorState

echo "🚀 Migrating Cognitive Ops Platform schema..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in environment"
    echo ""
    echo "Please set DATABASE_URL in .env.local or export it:"
    echo "export DATABASE_URL='postgresql://...'"
    exit 1
fi

echo "📦 Generating Prisma client..."
npx prisma generate

echo ""
echo "🗄️  Creating migration..."
npx prisma migrate dev --name add_orchestrator_state

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Verify migration: npx prisma studio"
echo "2. Deploy: npx vercel --prod"
echo "3. Test: Visit /dashboard and check OrchestratorView"

