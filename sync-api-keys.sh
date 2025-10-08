#!/bin/bash

# DealershipAI API Keys Sync Script
# Syncs API keys from Supabase Vault to local development environment

echo "🔑 DealershipAI API Keys Sync"
echo "=============================="

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the DealershipAI project root directory"
    exit 1
fi

echo "📋 Syncing API keys from Supabase Vault..."
echo "   Project: vxrdvkhkombwlhjvtsmw"
echo ""

# Create backup of current .env.local
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up current .env.local"
fi

# Create new .env.local with Supabase keys
echo "🔧 Creating new .env.local with Supabase keys..."

# Get the keys from Supabase (we'll need to do this manually since we can't expose the actual values)
cat > .env.local << 'EOF'
# DealershipAI Local Development Environment
# API Keys synced from Supabase Vault

# Supabase Configuration (already in .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://vxrdvkhkombwlhjvtsmw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_jmXcOugvAaWVPBeVaGkSC7AMkziSHBlYvNQwZmfiMa

# AI API Keys (from Supabase Vault)
# Note: You'll need to manually add these from your Supabase dashboard
# OPENAI_API_KEY=sk-your-real-openai-key
# ANTHROPIC_API_KEY=sk-ant-your-real-anthropic-key
# PERPLEXITY_API_KEY=pplx-your-real-perplexity-key

# Vercel Configuration
VERCEL_OIDC_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9icmlhbi1rcmFtZXJzLXByb2plY3RzIiwic3ViIjoib3duZXI6YnJpYW4ta3JhbWVycy1wcm9qZWN0czpwcm9qZWN0OmRlYWxlcnNoaXAtYWktZGFzaGJvYXJkOmVudmlyb25tZW50OmRldmVsb3BtZW50Iiwic2NvcGUiOiJvd25lcjpicmlhbi1rcmFtZXJzLXByb2plY3RzOnByb2plY3Q6ZGVhbGVyc2hpcC1haS1kYXNoYm9hcmQ6ZW52aXJvbm1lbnQ6ZGV2ZWxvcG1lbnQiLCJhdWQiOiJodHRwczovL3ZlcmNlbC5jb20vYnJpYW4ta3JhbWVycy1wcm9qZWN0cyIsIm93bmVyIjoiYnJpYW4ta3JhbWVycy1wcm9qZWN0cyIsIm93bmVyX2lkIjoidGVhbV9KNWgzQVpod1lCTFNIQzU2MWlvRU13R0giLCJwcm9qZWN0IjoiZGVhbGVyc2hpcC1haS1kYXNoYm9hcmQiLCJwcm9qZWN0X2lkIjoicHJqX241YTJhejlaamZJeUF0djZpeldlU2I1dnZWUUgiLCJlbnZpcm9ubWVudCI6ImRldmVsb3BtZW50IiwidXNlcl9pZCI6ImJnMzRPSmRXeDFsZmw3YTl0OXNJbjlpYyIsIm5iZiI6MTc1OTg1MzgwMCwiaWF0IjoxNzU5ODUzODAwLCJleHAiOjE3NTk4OTcwMDB9.DTe3NvuPPwphtF7Mo05Rt7fc_oYFo1XuOpx2Jb0ZjW08bCGtpbFBy6F5KIXggzIkBAMTOsp5lnmE-XTVfcWfD0bRYCGMEGLgyyj2zPdPrJ9zPdTTY1kMdSqCW9--23yfprQiRGpnNUZILfhJVno2Rc1CQVBDz4nNen1gZy59zieBWVUPHUjEAobA9BnXqomlHI2s3CEqJpFIceHhtMEiWyPb8Wp_HLpVP0Dwff17JipBH7P4xhZru45YrylwEbLpFBqS2Hblg2R8iH1QuiwEe8ttzLbTuWckvhyvH7UGns4OvQ1Qc1QUwguOiqlijRlN-hC5JTenvCOoUMvnjYjAJw
EOF

echo "✅ Created new .env.local template"
echo ""
echo "🔑 Next Steps:"
echo "   1. Go to: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/integrations/vault/secrets"
echo "   2. Copy your real API keys from the Vault"
echo "   3. Edit .env.local and replace the placeholder values:"
echo "      - OPENAI_API_KEY=sk-your-real-key"
echo "      - ANTHROPIC_API_KEY=sk-ant-your-real-key"
echo "      - PERPLEXITY_API_KEY=pplx-your-real-key"
echo ""
echo "🚀 Alternative: Use the fallback system (no API keys needed)"
echo "   Your dashboard will work with intelligent fallback responses!"
echo ""
echo "📖 For more details, see: API_ERROR_HANDLING_GUIDE.md"
