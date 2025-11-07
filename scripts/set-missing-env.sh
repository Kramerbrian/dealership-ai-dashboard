#!/bin/bash
# Helper script to set missing environment variables
# Shows what's missing and provides commands to set them

echo "🔐 Missing Environment Variables Check"
echo "======================================"
echo ""

# Check what's set
echo "📋 Checking current variables..."
echo ""

required_vars=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:✅"
  "CLERK_SECRET_KEY:✅"
  "SUPABASE_URL:❌"
  "SUPABASE_SERVICE_ROLE:❌"
  "UPSTASH_REDIS_REST_URL:❌"
  "UPSTASH_REDIS_REST_TOKEN:❌"
  "PUBLIC_BASE_URL:❌"
)

missing=()
set_vars=$(vercel env ls production 2>/dev/null | awk '{print $1}')

for var_info in "${required_vars[@]}"; do
  var_name="${var_info%%:*}"
  default_status="${var_info##*:}"
  
  if echo "$set_vars" | grep -q "^${var_name}$"; then
    echo "  ✅ $var_name"
  else
    echo "  ❌ $var_name (missing)"
    missing+=("$var_name")
  fi
done

echo ""
if [ ${#missing[@]} -eq 0 ]; then
  echo "✅ All required environment variables are set!"
else
  echo "📝 Missing variables (${#missing[@]}):"
  for var in "${missing[@]}"; do
    echo "   - $var"
  done
  
  echo ""
  echo "🔧 To set them, run these commands:"
  echo ""
  for var in "${missing[@]}"; do
    case $var in
      "SUPABASE_URL")
        echo "  vercel env add SUPABASE_URL production"
        echo "    # Get from: https://supabase.com/dashboard → Your Project → Settings → API → Project URL"
        ;;
      "SUPABASE_SERVICE_ROLE")
        echo "  vercel env add SUPABASE_SERVICE_ROLE production"
        echo "    # Get from: https://supabase.com/dashboard → Your Project → Settings → API → service_role key"
        ;;
      "UPSTASH_REDIS_REST_URL")
        echo "  vercel env add UPSTASH_REDIS_REST_URL production"
        echo "    # Get from: https://console.upstash.com → Your Database → REST API → REST URL"
        ;;
      "UPSTASH_REDIS_REST_TOKEN")
        echo "  vercel env add UPSTASH_REDIS_REST_TOKEN production"
        echo "    # Get from: https://console.upstash.com → Your Database → REST API → REST Token"
        ;;
      "PUBLIC_BASE_URL")
        echo "  vercel env add PUBLIC_BASE_URL production"
        echo "    # Your production domain, e.g., https://dash.dealershipai.com"
        ;;
    esac
    echo ""
  done
  
  echo "💡 Or run the interactive script:"
  echo "   ./scripts/setup-env.sh"
fi

