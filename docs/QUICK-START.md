# DealershipAI Dashboard - Quick Start Guide

## 10-Minute Setup to Revolution

*"The people who are crazy enough to think they can change the world, are the ones who do."*

This guide will get you from zero to a fully operational DealershipAI Dashboard in under 10 minutes.

## 🚀 Prerequisites

Before you begin, ensure you have:

- **Node.js 18.0.0+** installed ([Download](https://nodejs.org/))
- **npm or yarn** package manager
- **Git** installed
- A **Supabase account** (free tier works) ([Sign up](https://supabase.com))
- **API keys** for AI services (optional for initial setup)

## ⚡ Step-by-Step Setup

### Step 1: Clone the Repository (1 minute)

```bash
git clone https://github.com/yourusername/dealership-ai-dashboard
cd dealership-ai-dashboard
```

### Step 2: Install Dependencies (2 minutes)

```bash
npm install
```

This will install all required packages including:
- Next.js 14 with TypeScript
- React 18
- Supabase client
- Tailwind CSS
- AI service integrations
- All dashboard components

### Step 3: Environment Configuration (2 minutes)

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI API Keys (Optional for initial setup)
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_key
GEMINI_API_KEY=your_gemini_key

# Dashboard Configuration
NEXT_PUBLIC_DEFAULT_DEALER_ID=premium-auto
```

### Step 4: Database Setup (3 minutes)

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and API keys

2. **Run Database Migration:**
   ```bash
   # If using Prisma
   npx prisma generate
   npx prisma db push
   
   # Or run SQL directly in Supabase SQL Editor
   # See docs/DATABASE-SCHEMA.sql
   ```

3. **Add Sample Data:**
   ```sql
   INSERT INTO dealerships (id, name, domain, location) VALUES
   ('550e8400-e29b-41d4-a716-446655440000', 'Premium Auto Dealership', 'premiumauto.com', 'Cape Coral, FL');
   ```

### Step 5: Launch the Dashboard (1 minute)

```bash
npm run dev
```

Open your browser to:
```
http://localhost:3000/dashboard/premium-auto
```

## ✅ Verification Checklist

After setup, verify these components:

- [ ] Dashboard loads without errors
- [ ] Tab navigation works
- [ ] Header displays business information
- [ ] AI Intelligence block shows agent status
- [ ] No console errors in browser DevTools

## 🎯 Next Steps

### Immediate Actions

1. **Explore the Dashboard:**
   - Navigate between tabs (Overview, AI Intelligence, Website, Tools)
   - Check agent status indicators
   - Review sample metrics

2. **Configure Your Business:**
   - Update business information in the dashboard
   - Add your dealership details
   - Configure your domain and location

3. **Test AI Analysis:**
   - Click "AI Intelligence" tab
   - Try different analysis types
   - Review consensus scores

### Within 24 Hours

1. **Add Your API Keys:**
   - Configure all AI service keys
   - Test agent execution
   - Review analysis results

2. **Customize Dashboard:**
   - Update business information
   - Configure role-based access
   - Add custom blocks if needed

3. **Set Up Monitoring:**
   - Configure alerting
   - Set up automated reports
   - Enable real-time notifications

## 🆘 Troubleshooting

### Common Issues

**Dashboard won't load:**
```bash
# Check environment variables
cat .env.local

# Verify Supabase connection
# Test in Supabase dashboard
```

**Dependencies installation fails:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database connection errors:**
- Verify Supabase URL and keys
- Check RLS (Row Level Security) policies
- Ensure tables are created

**Build errors:**
- Check Node.js version: `node --version` (should be 18+)
- Update dependencies: `npm update`
- Check TypeScript errors: `npm run type-check`

## 📚 Additional Resources

- **[Complete DIY Guide](./DIY-GUIDE.md)** - Comprehensive implementation guide
- **[Deployment Guide](./DEPLOYMENT-GUIDE.md)** - Production deployment instructions
- **[API Documentation](./api.md)** - Integration reference
- **[Component Library](./components.md)** - UI building blocks

## 🎉 Success!

You now have a fully operational DealershipAI Dashboard! 

**What you've accomplished:**
- ✅ Complete dashboard system deployed
- ✅ Multi-agent AI system configured
- ✅ Real-time analytics active
- ✅ Competitive intelligence enabled

**Ready to revolutionize your dealership?** 

Start exploring the dashboard and see how AI-powered intelligence can transform your business.

---

*Think different. Act different. Be the change.* 🚀

