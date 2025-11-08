#!/bin/bash
# Script to copy AIM infrastructure to a different repository

set -e

SOURCE_DIR="/workspace/infrastructure/terraform"
DEST_DIR="${1:-./aim-infrastructure}"

if [ -z "$1" ]; then
  echo "Usage: $0 <destination-directory>"
  echo "Example: $0 /path/to/your/repo/infrastructure"
  exit 1
fi

echo "🚀 Copying AIM infrastructure..."
echo "   Source: $SOURCE_DIR"
echo "   Destination: $DEST_DIR"

# Create destination directory
mkdir -p "$DEST_DIR"

# Copy all files
echo "📋 Copying files..."
cp -r "$SOURCE_DIR"/* "$DEST_DIR/"

# Verify key files
echo "✅ Verifying structure..."
if [ -f "$DEST_DIR/main.tf" ] && [ -d "$DEST_DIR/modules" ]; then
  echo "   ✅ main.tf found"
  echo "   ✅ modules/ directory found"
  echo ""
  echo "✅ Copy complete!"
  echo ""
  echo "Next steps:"
  echo "  1. cd $DEST_DIR"
  echo "  2. Review and update terraform.tfvars"
  echo "  3. git add ."
  echo "  4. git commit -m 'Add AIM Terraform infrastructure'"
  echo "  5. git push"
else
  echo "❌ Error: Copy may have failed. Please verify manually."
  exit 1
fi
