#!/bin/bash

# Stripe CLI Installation Script
echo "💳 Installing Stripe CLI..."

# Create local bin directory if it doesn't exist
mkdir -p ~/.local/bin

# Download latest Stripe CLI
echo "📥 Downloading Stripe CLI..."
curl -L "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_$(uname -s)_$(uname -m).tar.gz" -o stripe.tar.gz

# Check if download was successful
if [ ! -s stripe.tar.gz ]; then
    echo "❌ Download failed. Trying alternative download method..."
    curl -L "https://github.com/stripe/stripe-cli/releases/download/v1.21.8/stripe_1.21.8_darwin_amd64.tar.gz" -o stripe.tar.gz
fi

# Extract the archive
echo "📦 Extracting Stripe CLI..."
tar -xzf stripe.tar.gz

# Move to local bin
echo "📁 Installing to ~/.local/bin..."
mv stripe ~/.local/bin/

# Make executable
chmod +x ~/.local/bin/stripe

# Add to PATH if not already there
if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
    echo "🔧 Adding ~/.local/bin to PATH..."
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    export PATH="$HOME/.local/bin:$PATH"
fi

# Clean up
rm -f stripe.tar.gz

# Test installation
echo "🧪 Testing installation..."
if ~/.local/bin/stripe --version &> /dev/null; then
    echo "✅ Stripe CLI installed successfully!"
    echo "Version: $(~/.local/bin/stripe --version)"
    echo ""
    echo "Next steps:"
    echo "1. Run: stripe login"
    echo "2. Test: stripe --version"
    echo "3. Listen to webhooks: stripe listen --forward-to localhost:3000/api/stripe/webhook"
else
    echo "❌ Installation failed. Please try manual installation."
    echo "See: STRIPE_CLI_MANUAL_SETUP.md"
fi
