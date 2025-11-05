#!/bin/bash
# Publish orchestrator snapshot to CDN
# Usage: ./scripts/publish-snapshot.sh

set -e

DASH_URL="${DASH_URL:-https://YOUR_DASH_DOMAIN}"
S3_BUCKET="${S3_BUCKET:-appraise-cdn}"
S3_PATH="${S3_PATH:-snapshots}"
LAST_ETAG_FILE="/tmp/last_snapshot_etag.txt"

# Fetch snapshot with ETag support
LAST_ETAG=$(cat "$LAST_ETAG_FILE" 2>/dev/null || echo "")
RESPONSE_FILE="/tmp/snapshot_response.json"
HEADERS_FILE="/tmp/snapshot_headers.txt"

# Make request and capture headers
HTTP_CODE=$(curl -s -w "%{http_code}" -o "$RESPONSE_FILE" \
  -D "$HEADERS_FILE" \
  -H "If-None-Match: $LAST_ETAG" \
  "$DASH_URL/api/orchestrator/snapshot")

# Extract ETag from headers
ETAG=$(grep -i "etag:" "$HEADERS_FILE" | cut -d' ' -f2 | tr -d '\r' || echo "")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Snapshot updated - publishing to CDN..."
  
  # Generate timestamp
  TIMESTAMP=$(date +%s)
  
  # Upload versioned snapshot (immutable)
  if command -v aws &> /dev/null; then
    aws s3 cp "$RESPONSE_FILE" \
      "s3://$S3_BUCKET/$S3_PATH/${TIMESTAMP}.json" \
      --cache-control "max-age=31536000,immutable" \
      --content-type "application/json"
    
    # Upload latest snapshot (cacheable for 60s)
    aws s3 cp "$RESPONSE_FILE" \
      "s3://$S3_BUCKET/$S3_PATH/latest.json" \
      --cache-control "max-age=60" \
      --content-type "application/json"
    
    echo "📦 Published to s3://$S3_BUCKET/$S3_PATH/${TIMESTAMP}.json"
    echo "📦 Updated latest.json"
  else
    echo "⚠️  AWS CLI not found - skipping S3 upload"
    echo "   Response saved to: $RESPONSE_FILE"
  fi
  
  # Save ETag for next run
  if [ -n "$ETAG" ]; then
    echo "$ETAG" > "$LAST_ETAG_FILE"
  fi
  
elif [ "$HTTP_CODE" = "304" ]; then
  echo "ℹ️  No changes (304 Not Modified)"
else
  echo "❌ Error: HTTP $HTTP_CODE"
  cat "$RESPONSE_FILE"
  exit 1
fi

