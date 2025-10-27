#!/bin/bash

# Install Stripe CLI from downloaded file
echo "💳 Installing Stripe CLI from downloaded file..."

# Check if stripe.tar.gz exists in current directory
if [ ! -f "stripe.tar.gz" ]; then
    echo "❌ stripe.tar.gz not found in current directory"
    echo "Please download it manually from:"
    echo "https://github.com/stripe/stripe-cli/releases/latest"
    echo "Save it as 'stripe.tar.gz' in this directory"
    exit 1
fi

# Check file size (should be more than 9 bytes)
if [ $(stat -f%z stripe.tar.gz) -lt 1000 ]; then
    echo "❌ Downloaded file is too small (likely corrupted)"
    echo "Please download manually from:"
    echo "https://github.com/stripe/stripe-cli/releases/latest"
    exit 1
fi

# Extract the archive
echo "📦 Extracting Stripe CLI..."
tar -xzf stripe.tar.gz

# Check if stripe binary was extracted
if [ ! -f "stripe" ]; then
    echo "❌ stripe binary not found after extraction"
    echo "Please check the downloaded file"
    exit 1
fi

# Create local bin directory
mkdir -p ~/.local/bin

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
    echo "❌ Installation failed. Please check the downloaded file."
fi

# Clean up
rm -f stripe.tar.gz
