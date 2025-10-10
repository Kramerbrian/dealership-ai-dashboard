# 🚀 Vercel Environment Variables Setup

## ⚠️ CRITICAL: Add These to Vercel Dashboard

Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables

### **Step 1: Fix Root Directory First**
1. Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/build-and-deployment
2. Find "Root Directory" field
3. Change to: `.` (single dot)
4. Save

### **Step 2: Add Environment Variables**

Copy and paste these EXACTLY into Vercel:

#### **Database (Required)**
```
DATABASE_URL
postgresql://postgres.vxrdvkhkombwlhjvtsmw:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

#### **Authentication - Ory (Required)**
```
ORY_SDK_URL
https://optimistic-haslett-3r8udelhc2.projects.oryapis.com

NEXT_PUBLIC_ORY_SDK_URL
https://optimistic-haslett-3r8udelhc2.projects.oryapis.com

ORY_PROJECT_ID
360ebb8f-2337-48cd-9d25-fba49a262f9c

ORY_WORKSPACE_ID
83af532a-eee6-4ad8-96c4-f4802a90940a
```

#### **Supabase (Required)**
```
NEXT_PUBLIC_SUPABASE_URL
https://vxrdvkhkombwlhjvtsmw.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
[GET_FROM_SUPABASE_DASHBOARD]

SUPABASE_SERVICE_ROLE_KEY
[GET_FROM_SUPABASE_DASHBOARD]
```

#### **Application (Required)**
```
NEXT_PUBLIC_APP_URL
https://dash.dealershipai.com

NODE_ENV
production

NEXTAUTH_URL
https://dash.dealershipai.com

NEXTAUTH_SECRET
[GENERATE_NEW_SECRET_32_CHARS]
```

#### **AI Services (Required)**
```
GPT_SERVICE_TOKEN
[YOUR_OPENAI_API_KEY]

ANTHROPIC_API_KEY
[YOUR_ANTHROPIC_API_KEY]
```

#### **Optional (Add Later)**
```
STRIPE_PUBLISHABLE_KEY
[STRIPE_PUBLISHABLE_KEY]

STRIPE_SECRET_KEY
[STRIPE_SECRET_KEY]

STRIPE_WEBHOOK_SECRET
[STRIPE_WEBHOOK_SECRET]
```

## 🔑 **How to Get Missing Keys**

### **Supabase Keys**
1. Go to: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/settings/api
2. Copy "anon public" key
3. Copy "service_role" key

### **Generate NextAuth Secret**
```bash
openssl rand -base64 32
```

### **OpenAI API Key**
1. Go to: https://platform.openai.com/api-keys
2. Create new key
3. Copy the key

### **Anthropic API Key**
1. Go to: https://console.anthropic.com/
2. Create new key
3. Copy the key

## ✅ **Verification Checklist**

After adding all variables:
- [ ] Root directory set to `.`
- [ ] All 12 required variables added
- [ ] All variables set for Production and Preview
- [ ] No trailing spaces in values
- [ ] All brackets `[]` removed from values

## 🚀 **Deploy**

After adding variables:
```bash
vercel --prod
```

Or push to GitHub:
```bash
git add .
git commit -m "Fix Vercel configuration"
git push origin main
```
