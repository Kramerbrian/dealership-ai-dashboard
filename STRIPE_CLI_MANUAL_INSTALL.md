# 💳 Stripe CLI Manual Installation Guide

## Current Issue
The automated download is failing (only 9 bytes downloaded). You need to download Stripe CLI manually.

## 🔧 **Step-by-Step Manual Installation**

### **Step 1: Download Stripe CLI**
1. Open your browser
2. Go to: https://github.com/stripe/stripe-cli/releases/latest
3. Find the file: `stripe_1.21.8_darwin_amd64.tar.gz`
4. Click "Download" and save to your Downloads folder

### **Step 2: Install Stripe CLI**
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

### **Step 3: Alternative Installation (No sudo required)**
```bash
# Create local bin directory
mkdir -p ~/.local/bin

# Navigate to Downloads
cd ~/Downloads

# Extract the archive
tar -xzf stripe_1.21.8_darwin_amd64.tar.gz

# Move to local bin
mv stripe ~/.local/bin/

# Make executable
chmod +x ~/.local/bin/stripe

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Test installation
stripe --version
```

## 🧪 **Testing Stripe CLI**

### **Step 1: Verify Installation**
```bash
stripe --version
```

### **Step 2: Login to Stripe**
```bash
stripe login
```

### **Step 3: Test Configuration**
```bash
stripe config --list
```

### **Step 4: Test Webhook Listening**
```bash
# Listen to webhooks (for development)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
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

3. **Update environment variables:**
   ```bash
   npx vercel env rm UPSTASH_REDIS_REST_URL production
   npx vercel env add UPSTASH_REDIS_REST_URL production
   npx vercel env rm UPSTASH_REDIS_REST_TOKEN production
   npx vercel env add UPSTASH_REDIS_REST_TOKEN production
   npx vercel env rm DATABASE_URL production
   npx vercel env add DATABASE_URL production
   ```

4. **Redeploy platform:**
   ```bash
   npx vercel --prod
   ```

## 🎯 **Ready to Launch!**

Once all services are connected, your DealershipAI platform will be fully operational! 🚀

## 📞 **Troubleshooting**

### If "command not found":
```bash
# Check if stripe is in PATH
which stripe
echo $PATH

# Add to PATH manually
export PATH="/usr/local/bin:$PATH"
# or
export PATH="$HOME/.local/bin:$PATH"
```

### If permission denied:
```bash
sudo chmod +x /usr/local/bin/stripe
# or
chmod +x ~/.local/bin/stripe
```

## 🎉 **Success!**

Once Stripe CLI is installed and working, you'll have:
- ✅ Stripe CLI for command-line operations
- ✅ Stripe Node.js SDK for application code
- ✅ Complete Stripe integration for DealershipAI

Your DealershipAI platform will be ready for production! 🚀
