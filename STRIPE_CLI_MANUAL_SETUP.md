# 💳 Stripe CLI Manual Setup Guide

## Option 1: Direct Download (Recommended)

### Step 1: Download Stripe CLI
1. Go to [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Click "Download Stripe CLI"
3. Select your operating system (macOS)
4. Download the `.tar.gz` file

### Step 2: Extract and Install
```bash
# Extract the downloaded file
tar -xzf stripe_*.tar.gz

# Move to a directory in your PATH
sudo mv stripe /usr/local/bin/

# Make it executable
sudo chmod +x /usr/local/bin/stripe

# Test installation
stripe --version
```

## Option 2: Using Homebrew (if available)

### Install Homebrew first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Then install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

## Option 3: Using npm (Alternative)

### Install stripe package:
```bash
npm install -g stripe
```

### Then use with npx:
```bash
npx stripe --version
npx stripe login
```

## Option 4: Manual Installation Script

Create this script and run it:

```bash
#!/bin/bash
# Install Stripe CLI manually

echo "Installing Stripe CLI..."

# Create local bin directory
mkdir -p ~/.local/bin

# Download latest release
curl -L "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_$(uname -s)_$(uname -m).tar.gz" -o stripe.tar.gz

# Extract
tar -xzf stripe.tar.gz

# Move to local bin
mv stripe ~/.local/bin/

# Make executable
chmod +x ~/.local/bin/stripe

# Add to PATH (add this to your ~/.zshrc or ~/.bash_profile)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Test
~/.local/bin/stripe --version

echo "✅ Stripe CLI installed successfully!"
echo "Run: stripe --version"
```

## After Installation

### 1. Login to Stripe
```bash
stripe login
```

### 2. Test the CLI
```bash
stripe --version
stripe config --list
```

### 3. Test Webhook Events
```bash
# Listen to webhooks (for development)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Troubleshooting

### If "command not found":
1. Check if Stripe CLI is in your PATH:
   ```bash
   which stripe
   echo $PATH
   ```

2. Add to PATH manually:
   ```bash
   export PATH="/path/to/stripe:$PATH"
   ```

### If permission denied:
```bash
sudo chmod +x /usr/local/bin/stripe
```

### Alternative: Use npx
If installation fails, you can use:
```bash
npx stripe-cli --version
npx stripe-cli login
```

## Verify Installation

Run these commands to verify everything works:

```bash
# Check version
stripe --version

# Login to Stripe
stripe login

# List your Stripe configuration
stripe config --list

# Test webhook listening
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Next Steps

Once Stripe CLI is installed:

1. **Login:** `stripe login`
2. **Test webhooks:** `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. **Create test products:** Use the commands in `STRIPE_CLI_SETUP.md`
4. **Test checkout flow:** Create test checkout sessions

Your DealershipAI platform will be ready for Stripe integration! 🚀
