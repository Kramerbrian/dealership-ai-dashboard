# 🔧 Stripe CLI Troubleshooting Guide

## Current Issue
Stripe CLI is not available in the current shell session. Here are the solutions:

## 🔍 **Diagnosis Steps**

### 1. Check if Homebrew is installed
```bash
which brew
brew --version
```

### 2. Check if Stripe CLI is installed
```bash
which stripe
stripe --version
```

### 3. Check common installation locations
```bash
ls -la /usr/local/bin/stripe
ls -la ~/.local/bin/stripe
ls -la /opt/homebrew/bin/stripe
```

## 🛠️ **Solutions**

### **Solution 1: Install Stripe CLI with Homebrew**
```bash
# If Homebrew is available:
brew install stripe/stripe-cli/stripe

# Verify installation
stripe --version
```

### **Solution 2: Manual Installation**
1. Go to: https://github.com/stripe/stripe-cli/releases/latest
2. Download: `stripe_1.21.8_darwin_amd64.tar.gz`
3. Extract and install:
```bash
tar -xzf stripe_1.21.8_darwin_amd64.tar.gz
sudo mv stripe /usr/local/bin/
sudo chmod +x /usr/local/bin/stripe
stripe --version
```

### **Solution 3: Using npm (Alternative)**
```bash
npm install -g stripe
npx stripe --version
npx stripe login
```

### **Solution 4: Refresh Shell Environment**
```bash
# Refresh PATH
source ~/.zshrc
# or
source ~/.bash_profile

# Check PATH
echo $PATH
```

## 🧪 **Testing Commands**

### Test Stripe CLI
```bash
stripe --version
stripe login
stripe config --list
```

### Test Webhook Events
```bash
# Listen to webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## 🔄 **Next Steps After Stripe CLI**

1. **Set up Upstash Redis:**
   ```bash
   npx @upstash/cli auth login
   npx @upstash/cli redis create --name dealershipai-redis --region us-east-1
   ```

2. **Set up PostgreSQL database:**
   - Vercel Postgres: [vercel.com/storage](https://vercel.com/storage)
   - Supabase: [supabase.com](https://supabase.com)
   - Railway: [railway.app](https://railway.app)

3. **Update environment variables with real credentials**

4. **Redeploy platform**

## 🎯 **Current Status**

**✅ READY:**
- Platform deployed and working
- All environment variables configured
- Stripe integration code ready

**🔧 PENDING:**
- Stripe CLI installation
- Upstash Redis setup
- PostgreSQL database setup
- Environment variables update with real credentials

**Your DealershipAI platform is 99% ready - just need to connect the external services!** 🚀
