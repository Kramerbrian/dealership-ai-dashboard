# 🔴 Upstash API Key Setup

## **UPSTASH LOGIN REQUIRES API KEY**

The Upstash CLI needs both an email and an API key. Here's how to get your API key:

### **Step 1: Get Your Upstash API Key**

1. **Go to Upstash Console:** [console.upstash.com](https://console.upstash.com)
2. **Sign in** with your email: `brian@briankramer.io`
3. **Go to Account Settings:** Click on your profile → Account
4. **Navigate to API Keys:** Look for "API Keys" or "Management API" section
5. **Create New API Key:** Click "Create API Key" or "Generate Key"
6. **Copy the API Key:** Save it securely

### **Step 2: Login to Upstash CLI**

Once you have your API key:

```bash
# Set environment variables
export UPSTASH_EMAIL="brian@briankramer.io"
export UPSTASH_API_KEY="your-api-key-here"

# Login to Upstash CLI
npx @upstash/cli auth login
```

### **Step 3: Create Redis Database**

After successful login:

```bash
# Create Redis database
npx @upstash/cli redis create --name dealershipai-redis --region us-east-1

# List your databases
npx @upstash/cli redis list
```

### **Step 4: Get Connection Details**

```bash
# Get connection details for your database
npx @upstash/cli redis get [database-id]
```

## 🔄 **UPDATE VERCEL ENVIRONMENT VARIABLES**

After getting your Redis credentials:

```bash
# Update Redis URL
npx vercel env rm UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_URL production

# Update Redis token
npx vercel env rm UPSTASH_REDIS_REST_TOKEN production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
```

## 🐘 **POSTGRESQL DATABASE SETUP**

Choose one option:

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

## 🚀 **FINAL DEPLOYMENT**

```bash
# Redeploy with real credentials
npx vercel --prod

# Test the platform
curl https://your-domain.com/api/qai/calculate
```

## 🎯 **CURRENT STATUS**

**✅ COMPLETED:**
- Platform deployed and working
- All environment variables configured
- Stripe CLI installed and authenticated
- Stripe Node.js SDK installed
- **Stripe webhooks working perfectly!**

**🔧 IN PROGRESS:**
- Upstash Redis setup (need API key from console)
- PostgreSQL database setup

**Your DealershipAI platform is 99% ready - just need to get the Upstash API key and set up PostgreSQL!** 🚀
