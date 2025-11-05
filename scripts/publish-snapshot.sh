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
curl -s "$DASH_URL/api/orchestrator/snapshot" -H "If-None-Match: $LAST_ETAG" -o /tmp/snap.json

# Check if we got a 304 (would be empty or error)
HTTP_CODE=$(curl -s -w "%{http_code}" -o /tmp/snap.json -H "If-None-Match: $LAST_ETAG" "$DASH_URL/api/orchestrator/snapshot" | tail -1)

if [ "$HTTP_CODE" = "200" ]; then
  TIMESTAMP=$(date +%s)
  aws s3 cp /tmp/snap.json "s3://$S3_BUCKET/$S3_PATH/${TIMESTAMP}.json" --cache-control "max-age=31536000,immutable"
  aws s3 cp /tmp/snap.json "s3://$S3_BUCKET/$S3_PATH/latest.json" --cache-control "max-age=60"
  echo "✅ Published snapshot ${TIMESTAMP}.json and latest.json"
elif [ "$HTTP_CODE" = "304" ]; then
  echo "ℹ️  No changes (304 Not Modified)"
else
  echo "❌ Error: HTTP $HTTP_CODE"
  exit 1
fi

