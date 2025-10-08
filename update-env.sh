#!/bin/bash

echo "╔═══════════════════════════════════════════╗"
echo "║  Environment Variables Setup              ║"
echo "║  DealershipAI Platform                    ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

echo "This script will help you update your .env file with real credentials"
echo ""

# Read Supabase Anon Key
echo -n "📝 Paste your Supabase ANON key: "
read SUPABASE_ANON_KEY

# Read Supabase Service Role Key
echo -n "📝 Paste your Supabase SERVICE_ROLE key: "
read SUPABASE_SERVICE_KEY

# Read Clerk Publishable Key
echo -n "📝 Paste your Clerk PUBLISHABLE key: "
read CLERK_PUB_KEY

# Read Clerk Secret Key
echo -n "📝 Paste your Clerk SECRET key: "
read CLERK_SECRET

# Update .env file
echo ""
echo "✏️  Updating .env file..."

sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" .env
sed -i '' "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUB_KEY|" .env
sed -i '' "s|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=$CLERK_SECRET|" .env

echo "✅ .env file updated successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Add the same variables to Vercel (already opened in browser)"
echo "2. Run: vercel env pull .env.local"
echo "3. Restart dev server: npm run dev"
