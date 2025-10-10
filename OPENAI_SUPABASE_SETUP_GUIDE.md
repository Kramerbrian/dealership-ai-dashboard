# OpenAI & Supabase Setup Guide for DealershipAI

## 🎯 **Complete Configuration Steps**

This guide will walk you through setting up the remaining configuration tasks for the DealershipAI platform.

---

## **Step 1: Database Migration in Supabase** 🗄️

### **1.1 Access Supabase Dashboard**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your DealershipAI project

### **1.2 Run the Migration**
1. Navigate to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the contents of `supabase/migrations/20250110000000_add_aiv_tables.sql`
4. Click **"Run"** to execute the migration

### **1.3 Verify Migration Success**
1. Go to **Table Editor** in the left sidebar
2. Verify these tables were created:
   - `aiv_weekly` - Main metrics table
   - `audit_log` - Change tracking
   - `dealer_access` - User permissions
   - `dealers` - Dealer information

### **1.4 Configure Row Level Security (RLS)**
1. Go to **Authentication** → **Policies**
2. Verify RLS is enabled for all tables
3. Check that policies are created (they should be auto-created by the migration)

---

## **Step 2: OpenAI Assistant Setup** 🤖

### **2.1 Create OpenAI Assistant**
1. Go to [https://platform.openai.com/assistants](https://platform.openai.com/assistants)
2. Click **"Create Assistant"**
3. Configure the assistant:
   - **Name**: `DealershipAI AIV Calculator`
   - **Instructions**: 
     ```
     You are DealershipAI, an expert in automotive AI visibility analysis. 
     
     Your role is to compute Algorithmic Visibility Index (AIV) metrics for car dealerships.
     
     Always respond with valid JSON containing these exact fields:
     - aiv: number (0-100) - Overall AI visibility across platforms
     - ati: number (0-100) - Answer Engine Intelligence score  
     - crs: number (0-100) - Citation Relevance Score
     - elasticity_usd_per_pt: number - Revenue impact per AIV point improvement
     - r2: number (0-1) - Statistical confidence in the model
     - recommendations: array of strings - Top 3 actionable insights
     
     Base your analysis on real automotive industry data and AI platform behavior.
     ```
   - **Model**: `gpt-4-turbo-preview`
   - **Tools**: None required
   - **Files**: None required

### **2.2 Get Assistant ID**
1. After creating the assistant, copy the **Assistant ID** (starts with `asst_`)
2. Save this ID - you'll need it for environment variables

---

## **Step 3: Environment Variables Configuration** ⚙️

### **3.1 Create .env.local File**
Create a `.env.local` file in your project root with these variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=asst_your_assistant_id_here
OPENAI_MODEL=gpt-4-turbo-preview

# Supabase Configuration  
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Redis for caching (if using)
REDIS_URL=your_redis_url_here
```

### **3.2 Get Supabase Credentials**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### **3.3 Get OpenAI API Key**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Copy the key → `OPENAI_API_KEY`

---

## **Step 4: Test the Configuration** 🧪

### **4.1 Restart Development Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### **4.2 Test API Endpoints**
Run these commands to verify everything works:

```bash
# Test GPT Proxy
curl -X POST http://localhost:3000/api/gpt-proxy \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Test AIV Metrics (should return live data now)
curl http://localhost:3000/api/aiv-metrics?dealerId=demo-dealer

# Test Elasticity Recompute
curl -X POST http://localhost:3000/api/elasticity/recompute \
  -H "Content-Type: application/json" \
  -d '{"dealerId":"demo-dealer"}'
```

### **4.3 Verify Dashboard**
1. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Check that AIV Metrics Panel shows live data
3. Verify "Demo" badge changes to "Live"

---

## **Step 5: Production Deployment** 🚀

### **5.1 Vercel Environment Variables**
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all the environment variables from `.env.local`

### **5.2 Deploy**
```bash
# Push to GitHub (if not already done)
git add .
git commit -m "Add OpenAI and Supabase configuration"
git push origin main

# Vercel will auto-deploy
```

---

## **Troubleshooting** 🔧

### **Common Issues:**

1. **"No assistant found" error**
   - Verify `OPENAI_ASSISTANT_ID` is correct
   - Check that the assistant exists in your OpenAI dashboard

2. **"Supabase not configured" warnings**
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
   - Check that the migration was run successfully

3. **RLS policy errors**
   - Ensure user authentication is working
   - Check that `dealer_access` table has proper entries

4. **API key errors**
   - Verify `OPENAI_API_KEY` is valid and has sufficient credits
   - Check that the key has the correct permissions

### **Verification Checklist:**
- [ ] Supabase migration completed successfully
- [ ] OpenAI Assistant created and configured
- [ ] Environment variables set correctly
- [ ] API endpoints returning live data
- [ ] Dashboard showing "Live" status
- [ ] No console errors in browser
- [ ] Production deployment successful

---

## **Next Steps** 🎯

Once configuration is complete:

1. **Add Real Dealer Data**: Replace demo data with actual dealership information
2. **Configure User Access**: Set up proper user roles and permissions
3. **Set Up Monitoring**: Configure alerts for API failures and data quality
4. **Scale Testing**: Test with multiple dealers and concurrent users
5. **Performance Optimization**: Monitor and optimize API response times

---

## **Support** 📞

If you encounter any issues:

1. Check the browser console for errors
2. Review server logs in terminal
3. Verify all environment variables are set
4. Test each API endpoint individually
5. Check Supabase logs in the dashboard

**The system is now ready for production use!** 🎉
