#!/bin/bash
# Register canonical bundle with DealershipAI Canonical Registry

if [ -z "$REGISTRY_TOKEN" ]; then
  echo "Missing REGISTRY_TOKEN environment variable" >&2
  exit 1
fi

curl -X POST https://registry.dealershipai.io/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGISTRY_TOKEN" \
  -d @canonical.json

