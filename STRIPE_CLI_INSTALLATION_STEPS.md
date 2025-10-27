# 💳 Stripe CLI Installation - Step by Step

## Current Issue
The automated download is failing due to GitHub redirects. Here's how to install manually:

## Method 1: Direct Browser Download (Recommended)

### Step 1: Download Stripe CLI
1. Open your browser
2. Go to: https://github.com/stripe/stripe-cli/releases/latest
3. Find the file: `stripe_1.21.8_darwin_amd64.tar.gz` (or latest version)
4. Click "Download" and save to your Downloads folder

### Step 2: Install Stripe CLI
```bash
# Navigate to Downloads
cd ~/Downloads

# Extract the archive
tar -xzf stripe_1.21.8_darwin_amd64.tar.gz

# Move to a directory in your PATH
sudo mv stripe /usr/local/bin/

# Make it executable
sudo chmod +x /usr/local/bin/stripe

# Test installation
stripe --version
```

## Method 2: Using Homebrew (Requires Admin Access)

### Step 1: Install Homebrew
```bash
# This requires sudo access
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### Step 2: Install Stripe CLI
```bash
brew install stripe/stripe-cli/stripe
```

## Method 3: Manual Installation to Local Directory

### Step 1: Create Local Directory
```bash
mkdir -p ~/.local/bin
```

### Step 2: Download and Install
```bash
# Download (you'll need to do this manually from browser)
# Save stripe_1.21.8_darwin_amd64.tar.gz to ~/.local/bin/

# Extract
cd ~/.local/bin
tar -xzf stripe_1.21.8_darwin_amd64.tar.gz

# Make executable
chmod +x stripe

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Test
stripe --version
```

## Method 4: Using npm (Alternative)

```bash
# Install stripe package
npm install -g stripe

# Use with npx
npx stripe --version
npx stripe login
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

### 3. Test Webhook Listening
```bash
# Listen to webhooks (for development)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
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
   export PATH="/usr/local/bin:$PATH"
   # or
   export PATH="$HOME/.local/bin:$PATH"
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

## Next Steps

Once Stripe CLI is installed:

1. **Login:** `stripe login`
2. **Test webhooks:** `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. **Create test products:** Use the commands in `STRIPE_CLI_SETUP.md`
4. **Test checkout flow:** Create test checkout sessions

## Quick Test Commands

```bash
# Check version
stripe --version

# Login to Stripe
stripe login

# List configuration
stripe config --list

# Listen to webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Your DealershipAI platform will be ready for Stripe integration! 🚀
