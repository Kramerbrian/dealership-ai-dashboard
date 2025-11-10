#!/bin/bash

# Auto-setup Clerk Keys from existing sources
# Checks sync-api-keys.sh and other sources for Clerk keys

echo "🔐 Auto-Setup Clerk Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check sync-api-keys.sh for Clerk keys
if [ -f "sync-api-keys.sh" ]; then
    echo "📋 Checking sync-api-keys.sh for Clerk keys..."
    PUB_KEY=$(grep -E "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" sync-api-keys.sh | head -1 | cut -d'=' -f2 | tr -d "'" | tr -d '"' | xargs)
    SEC_KEY=$(grep -E "^CLERK_SECRET_KEY=" sync-api-keys.sh | head -1 | cut -d'=' -f2 | tr -d "'" | tr -d '"' | xargs)
    
    # Debug output
    if [ -n "$PUB_KEY" ]; then
        echo "   Found PUB_KEY: ${PUB_KEY:0:30}..."
    fi
    if [ -n "$SEC_KEY" ]; then
        echo "   Found SEC_KEY: ${SEC_KEY:0:30}..."
    fi
    
    if [ -n "$PUB_KEY" ] && [ -n "$SEC_KEY" ] && [ "$PUB_KEY" != "" ] && [ "$SEC_KEY" != "" ] && [ "$PUB_KEY" != "pk_test_" ] && [ "$SEC_KEY" != "sk_test_" ]; then
        echo "✅ Found Clerk keys in sync-api-keys.sh"
        echo ""
        echo "Publishable Key: ${PUB_KEY:0:30}..."
        echo "Secret Key: ${SEC_KEY:0:30}..."
        echo ""
        read -p "Use these keys? (y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Backup .env.local
            if [ -f .env.local ]; then
                cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
            fi
            
            # Add keys to .env.local
            if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local 2>/dev/null; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUB_KEY|" .env.local
                else
                    sed -i "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUB_KEY|" .env.local
                fi
            else
                echo "" >> .env.local
                echo "# Clerk Authentication" >> .env.local
                echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUB_KEY" >> .env.local
            fi
            
            if grep -q "CLERK_SECRET_KEY=" .env.local 2>/dev/null; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=$SEC_KEY|" .env.local
                else
                    sed -i "s|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=$SEC_KEY|" .env.local
                fi
            else
                echo "CLERK_SECRET_KEY=$SEC_KEY" >> .env.local
            fi
            
            echo ""
            echo "✅ Keys added to .env.local"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "📋 Next Steps:"
            echo "1. Configure Clerk redirects in dashboard:"
            echo "   - After Sign In: /onboarding"
            echo "   - After Sign Up: /onboarding"
            echo ""
            echo "2. Restart server:"
            echo "   pkill -f 'next dev' && npm run dev"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            exit 0
        fi
    fi
fi

# If no keys found, run the interactive script
echo "⚠️  No keys found in sync-api-keys.sh"
echo "Running interactive setup..."
echo ""
./scripts/setup-clerk-keys.sh

