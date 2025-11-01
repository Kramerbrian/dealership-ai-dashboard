#!/bin/bash
# Local Webhook Testing Script
# Tests PLG flow webhooks using local server

set -e

BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
CLERK_SECRET="${CLERK_WEBHOOK_SECRET:-test_secret}"
STRIPE_SECRET="${STRIPE_WEBHOOK_SECRET:-test_secret}"

echo "🧪 Testing PLG Flow Webhooks"
echo "=============================="
echo "Base URL: $BASE_URL"
echo ""

# Phase 1: Clerk webhook
echo "📝 Phase 1: Testing Clerk webhook (user.created)"
curl -X POST "$BASE_URL/api/clerk/webhook" \
  -H "Content-Type: application/json" \
  -H "svix-id: test-$(date +%s)" \
  -H "svix-timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -H "svix-signature: test-signature" \
  -d @scripts/test-webhook-payloads.json \
  | jq '.' || echo "⚠️  Webhook endpoint may require proper signature"

echo ""
echo ""

# Phase 2: Checkout session (requires auth)
echo "📝 Phase 2: Testing checkout session creation"
echo "⚠️  Note: This requires authentication - test manually with:"
echo "   curl -X POST $BASE_URL/api/checkout/session \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"plan\":\"professional\",\"domain\":\"test.com\"}'"

echo ""
echo ""

# Phase 3: Stripe webhook
echo "📝 Phase 3: Testing Stripe webhook (checkout.session.completed)"
echo "⚠️  Note: This requires proper Stripe signature - use Stripe CLI:"
echo "   stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo "   stripe trigger checkout.session.completed"

echo ""
echo ""

# Phase 4: ACP webhook
echo "📝 Phase 4: Testing ACP webhook (agentic.order.completed)"
echo "⚠️  Note: This requires proper Stripe signature - use Stripe CLI:"
echo "   stripe listen --forward-to localhost:3000/api/acp/webhook"
echo "   stripe trigger agentic.order.completed"

echo ""
echo ""
echo "✅ Test script complete!"
echo "For full end-to-end testing, use: npm run test:plg"

