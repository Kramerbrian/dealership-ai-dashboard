#!/bin/bash

# Environment Variable Verification Script
# Checks that required environment variables are configured

set -e

echo "🔍 Verifying Environment Variables"
echo "===================================="
echo ""

ERRORS=0
WARNINGS=0

check_var() {
    local var_name=$1
    local required=$2
    local description=$3
    
    if [ -f .env.local ]; then
        value=$(grep "^${var_name}=" .env.local 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    else
        value=""
    fi
    
    if [ -z "$value" ] || [ "$value" = "your-${var_name,,}" ] || [[ "$value" == *"your-"* ]] || [[ "$value" == *"example"* ]]; then
        if [ "$required" = "required" ]; then
            echo "❌ ${var_name}: NOT CONFIGURED (REQUIRED)"
            echo "   ${description}"
            ((ERRORS++))
        else
            echo "⚠️  ${var_name}: Not configured (optional)"
            echo "   ${description}"
            ((WARNINGS++))
        fi
    else
        # Mask sensitive values
        if [[ "$var_name" == *"KEY"* ]] || [[ "$var_name" == *"TOKEN"* ]] || [[ "$var_name" == *"SECRET"* ]]; then
            masked="${value:0:10}...${value: -4}"
            echo "✅ ${var_name}: Configured (${masked})"
        else
            echo "✅ ${var_name}: Configured"
        fi
    fi
}

echo "📋 Required Variables:"
echo "---------------------"
check_var "NEXT_PUBLIC_SUPABASE_URL" "required" "Supabase project URL"
check_var "SUPABASE_SERVICE_ROLE_KEY" "required" "Supabase service role key"
check_var "UPSTASH_REDIS_REST_URL" "required" "Upstash Redis REST URL"
check_var "UPSTASH_REDIS_REST_TOKEN" "required" "Upstash Redis REST token"

echo ""
echo "📊 Optional Data Sources:"
echo "------------------------"
check_var "PULSE_API_URL" "optional" "Pulse API endpoint"
check_var "PULSE_API_KEY" "optional" "Pulse API key"
check_var "ATI_API_URL" "optional" "ATI API endpoint"
check_var "ATI_API_KEY" "optional" "ATI API key"
check_var "CIS_API_URL" "optional" "CIS API endpoint"
check_var "CIS_API_KEY" "optional" "CIS API key"
check_var "PROBE_API_URL" "optional" "Probe API endpoint"
check_var "PROBE_API_KEY" "optional" "Probe API key"

echo ""
echo "🔔 Optional Notifications:"
echo "-------------------------"
check_var "SLACK_WEBHOOK_URL" "optional" "Slack webhook URL"
check_var "SLACK_ALERT_WEBHOOK_URL" "optional" "Slack alert webhook URL"

echo ""
echo "===================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All required variables configured!"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  ${WARNINGS} optional variables not configured (will use mocks/fallbacks)"
    fi
    exit 0
else
    echo "❌ ${ERRORS} required variable(s) missing!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local"
    echo "2. Configure missing variables"
    echo "3. Run this script again"
    exit 1
fi

