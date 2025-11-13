#!/bin/bash
# Update hashes for canonical bundle components
# Usage: ./canonical/update-hashes.sh

set -e

cd "$(dirname "$0")/.."

if [ ! -f "canonical/version.json" ]; then
  echo "❌ canonical/version.json not found"
  exit 1
fi

echo "📦 Updating SHA256 hashes for DealershipAI Agentic Canonical..."

# Extract all component files from version.json
for file in $(jq -r '.components | .[] | .[]' canonical/version.json); do
  if [ -f "canonical/agentic/$file" ]; then
    hash=$(shasum -a 256 "canonical/agentic/$file" | cut -d " " -f 1)
    echo "$file: sha256:$hash"
  else
    echo "⚠️  File not found: canonical/agentic/$file"
  fi
done

echo ""
echo "To update version.json with these hashes, run:"
echo ""
echo "for file in \$(jq -r '.components | .[] | .[]' canonical/version.json); do"
echo "  if [ -f \"canonical/agentic/\$file\" ]; then"
echo "    hash=\$(shasum -a 256 \"canonical/agentic/\$file\" | cut -d ' ' -f 1)"
echo "    jq --arg f \"\$file\" --arg h \"sha256:\$hash\" '.hashes[\$f] = \$h' \\"
echo "      canonical/version.json > tmp.\$\$.json && mv tmp.\$\$.json canonical/version.json"
echo "  fi"
echo "done"
