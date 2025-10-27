# 🚀 DealershipAI Final Installation Guide

## Current Status ✅
- **Platform:** https://dealership-ai-dashboard-fmx4xghdz-brian-kramer-dealershipai.vercel.app
- **Environment Variables:** All configured in Vercel
- **Issue:** Automated Stripe CLI download failing due to GitHub redirects

## 🔧 Manual Installation Required

### **Step 1: Install Stripe CLI (Manual Download)**

**Option A: Browser Download (Recommended)**
1. Open your browser
2. Go to: https://github.com/stripe/stripe-cli/releases/latest
3. Download: `stripe_1.21.8_darwin_amd64.tar.gz`
4. Save to your Downloads folder

**Option B: Using Homebrew (if available)**
```bash
# If you have Homebrew installed:
brew install stripe/stripe-cli/stripe
```

### **Step 2: Install Stripe CLI from Downloaded File**

```bash
# Navigate to Downloads
cd ~/Downloads

# Extract the archive
tar -xzf stripe_1.21.8_darwin_amd64.tar.gz

# Create local bin directory
mkdir -p ~/.local/bin

# Move stripe to local bin
mv stripe ~/.local/bin/

# Make executable
chmod +x ~/.local/bin/stripe

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Test installation
stripe --version
```

### **Step 3: Login to Stripe**
```bash
stripe login
```

### **Step 4: Test Stripe CLI**
```bash
stripe --version
stripe config --list
```

## 🔴 **Step 5: Set Up Upstash Redis**

```bash
# Login to Upstash
npx @upstash/cli auth login

# Create Redis database
npx @upstash/cli redis create --name dealershipai-redis --region us-east-1

# Get connection details
npx @upstash/cli redis list
```

## 🐘 **Step 6: Set Up PostgreSQL Database**

**Choose one option:**

### **Option A: Vercel Postgres (Recommended)**
1. Go to [vercel.com/storage](https://vercel.com/storage)
2. Create new Postgres database
3. Copy connection string
4. Update `DATABASE_URL` in Vercel

### **Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `DATABASE_URL` in Vercel

### **Option C: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL service
3. Copy connection string
4. Update `DATABASE_URL` in Vercel

## 🔄 **Step 7: Update Environment Variables**

After setting up external services:

```bash
# Update Redis credentials
npx vercel env rm UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_URL production

npx vercel env rm UPSTASH_REDIS_REST_TOKEN production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production

# Update database URL
npx vercel env rm DATABASE_URL production
npx vercel env add DATABASE_URL production
```

## 🚀 **Step 8: Final Deployment**

```bash
# Redeploy with real credentials
npx vercel --prod

# Test the platform
curl https://your-domain.com/api/qai/calculate
```

## 🧪 **Testing Commands**

### Test Stripe CLI
```bash
stripe --version
stripe login
stripe config --list
```

### Test Upstash Redis
```bash
npx @upstash/cli auth whoami
npx @upstash/cli redis list
```

### Test Database
```bash
npx prisma db pull
npx prisma studio
```

## 📊 **Production Checklist**

- [ ] Stripe CLI installed and logged in
- [ ] Upstash Redis database created
- [ ] PostgreSQL database set up
- [ ] Environment variables updated with real credentials
- [ ] Platform redeployed
- [ ] All features tested

## 🎯 **Ready to Launch!**

Once all services are connected:
1. **Test the platform** with real data
2. **Set up custom domain** (dealershipai.com)
3. **Start acquiring customers**
4. **Monitor performance**

Your DealershipAI platform will be fully operational! 🚀

## 📞 **Support**

If you encounter issues:
1. Check the detailed setup guides in the project
2. Verify all environment variables are set
3. Test each service individually
4. Redeploy after making changes

**The platform is 99% ready - just need to connect the external services!** 🎉
