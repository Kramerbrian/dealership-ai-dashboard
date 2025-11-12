#!/bin/bash

# Clerk Keys Setup Script
# Pulls keys from .env.local, Supabase CLI, or Vercel CLI

echo "🔐 Clerk Authentication Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating it..."
    touch .env.local
fi

# Function to extract keys from source
extract_keys() {
    local source=$1
    local publishable_key=""
    local secret_key=""
    
    case $source in
        "env.local")
            if [ -f .env.local ]; then
                publishable_key=$(grep -E "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                secret_key=$(grep -E "^CLERK_SECRET_KEY=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
            fi
            ;;
        "vercel")
            if command -v vercel &> /dev/null; then
                echo "   📡 Fetching keys from Vercel..."
                # Try to pull env vars to temp file
                TEMP_FILE=".env.vercel.tmp.$$"
                if vercel env pull "$TEMP_FILE" --yes --environment=development 2>/dev/null; then
                    if [ -f "$TEMP_FILE" ]; then
                        publishable_key=$(grep -E "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" "$TEMP_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        secret_key=$(grep -E "^CLERK_SECRET_KEY=" "$TEMP_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
                        rm -f "$TEMP_FILE"
                    fi
                fi
            fi
            ;;
        "supabase")
            # Supabase secrets list only shows digests, not actual values
            # We can't extract the actual keys from Supabase CLI
            # This is a security feature - secrets are encrypted
            echo "   ⚠️  Supabase secrets are encrypted (digests only)"
            echo "   💡 Tip: Get keys from Vercel or Clerk dashboard instead"
            ;;
    esac
    
    # Return keys (publishable_key|secret_key)
    echo "${publishable_key}|${secret_key}"
}

# Try to find keys from multiple sources
echo "🔍 Searching for Clerk keys..."
echo ""

PUBLISHABLE_KEY=""
SECRET_KEY=""
SOURCE=""

# Priority 1: Check .env.local
echo "1. Checking .env.local..."
KEYS=$(extract_keys "env.local")
PUBLISHABLE_KEY=$(echo "$KEYS" | cut -d'|' -f1)
SECRET_KEY=$(echo "$KEYS" | cut -d'|' -f2)

if [ -n "$PUBLISHABLE_KEY" ] && [ -n "$SECRET_KEY" ] && [ "$PUBLISHABLE_KEY" != "" ] && [ "$SECRET_KEY" != "" ]; then
    echo "   ✅ Found keys in .env.local"
    SOURCE=".env.local"
else
    echo "   ⚠️  No valid keys in .env.local"
    PUBLISHABLE_KEY=""
    SECRET_KEY=""
fi

# Priority 2: Try Vercel CLI
if [ -z "$PUBLISHABLE_KEY" ] && command -v vercel &> /dev/null; then
    echo ""
    echo "2. Checking Vercel..."
    KEYS=$(extract_keys "vercel")
    TEMP_PUB=$(echo "$KEYS" | cut -d'|' -f1)
    TEMP_SEC=$(echo "$KEYS" | cut -d'|' -f2)
    
    if [ -n "$TEMP_PUB" ] && [ -n "$TEMP_SEC" ] && [ "$TEMP_PUB" != "" ] && [ "$TEMP_SEC" != "" ]; then
        echo "   ✅ Found keys in Vercel"
        PUBLISHABLE_KEY="$TEMP_PUB"
        SECRET_KEY="$TEMP_SEC"
        SOURCE="Vercel"
    else
        echo "   ⚠️  No keys found in Vercel (or not logged in)"
        echo "   💡 Run: vercel login (if not logged in)"
    fi
elif [ -z "$PUBLISHABLE_KEY" ] && [ ! -x "$(command -v vercel)" ]; then
    echo ""
    echo "2. Vercel CLI not installed"
    echo "   💡 Install: npm i -g vercel"
    echo "   💡 Then run: vercel login"
fi

# Priority 3: Check Supabase (informational only - can't extract values)
if [ -z "$PUBLISHABLE_KEY" ] && command -v supabase &> /dev/null; then
    echo ""
    echo "3. Checking Supabase..."
    extract_keys "supabase"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# If keys found, ask to use them
if [ -n "$PUBLISHABLE_KEY" ] && [ -n "$SECRET_KEY" ] && [ "$PUBLISHABLE_KEY" != "" ] && [ "$SECRET_KEY" != "" ]; then
    echo ""
    echo "✅ Found Clerk keys from: $SOURCE"
    echo ""
    echo "Publishable Key: ${PUBLISHABLE_KEY:0:20}..."
    echo "Secret Key: ${SECRET_KEY:0:20}..."
    echo ""
    read -p "Use these keys? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "⏭️  Skipping. You can add keys manually."
        exit 0
    fi
else
    # No keys found, prompt for manual entry
    echo ""
    echo "⚠️  No Clerk keys found in any source."
    echo ""
    echo "📋 Options to get your Clerk keys:"
    echo ""
    echo "Option 1: Clerk Dashboard (Recommended)"
    echo "   1. Go to: https://dashboard.clerk.com/"
    echo "   2. Sign in or create an account"
    echo "   3. Create a new application (or select existing)"
    echo "   4. Go to 'API Keys' section"
    echo "   5. Copy your keys"
    echo ""
    echo "Option 2: Vercel Dashboard"
    echo "   1. Go to: https://vercel.com/dashboard"
    echo "   2. Select your project"
    echo "   3. Go to Settings → Environment Variables"
    echo "   4. Find NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY"
    echo "   5. Copy the values"
    echo ""
    echo "Option 3: Install Vercel CLI"
    echo "   npm i -g vercel"
    echo "   vercel login"
    echo "   vercel env pull .env.vercel"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Get Publishable Key
    echo "Enter your Clerk Publishable Key (starts with pk_test_ or pk_live_):"
    read -p "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " PUBLISHABLE_KEY
    
    if [ -z "$PUBLISHABLE_KEY" ]; then
        echo "❌ Publishable key cannot be empty"
        exit 1
    fi
    
    # Get Secret Key
    echo ""
    echo "Enter your Clerk Secret Key (starts with sk_test_ or sk_live_):"
    read -p "CLERK_SECRET_KEY: " SECRET_KEY
    
    if [ -z "$SECRET_KEY" ]; then
        echo "❌ Secret key cannot be empty"
        exit 1
    fi
    
    SOURCE="manual"
fi

# Validate key formats
if [[ ! "$PUBLISHABLE_KEY" =~ ^pk_(test|live)_ ]]; then
    echo "⚠️  Warning: Publishable key should start with 'pk_test_' or 'pk_live_'"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if [[ ! "$SECRET_KEY" =~ ^sk_(test|live)_ ]]; then
    echo "⚠️  Warning: Secret key should start with 'sk_test_' or 'sk_live_'"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Backup .env.local
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up .env.local"

# Update or add keys
if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local; then
    # Update existing key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLISHABLE_KEY|" .env.local
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLISHABLE_KEY|" .env.local
    fi
else
    # Add new key
    echo "" >> .env.local
    echo "# Clerk Authentication" >> .env.local
    echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLISHABLE_KEY" >> .env.local
fi

if grep -q "CLERK_SECRET_KEY=" .env.local; then
    # Update existing key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=$SECRET_KEY|" .env.local
    else
        # Linux
        sed -i "s|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=$SECRET_KEY|" .env.local
    fi
else
    # Add new key
    echo "CLERK_SECRET_KEY=$SECRET_KEY" >> .env.local
fi

echo ""
echo "✅ Keys added to .env.local (from $SOURCE)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "1. Configure Clerk redirects in dashboard:"
echo "   - After Sign In: /onboarding"
echo "   - After Sign Up: /onboarding"
echo ""
echo "2. Restart your dev server:"
echo "   pkill -f 'next dev' && npm run dev"
echo ""
echo "3. Verify server is running:"
echo "   curl -I http://localhost:3000"
echo ""
echo "4. Test authentication:"
echo "   Open http://localhost:3000 and click 'Sign Up'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
