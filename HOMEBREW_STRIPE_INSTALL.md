# 🍺 Homebrew + Stripe CLI Installation

## Since you have Homebrew working, here are the exact commands to run:

### **Step 1: Install Stripe CLI**
```bash
brew install stripe/stripe-cli/stripe
```

### **Step 2: Verify Installation**
```bash
stripe --version
```

### **Step 3: Login to Stripe**
```bash
stripe login
```

### **Step 4: Test the CLI**
```bash
stripe config --list
```

### **Step 5: Test Webhook Listening**
```bash
# Listen to webhooks (for development)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
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
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
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
