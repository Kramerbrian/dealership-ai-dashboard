# Vercel CLI Environment Variables Setup

## ⚠️ Interactive Setup Required

The Vercel CLI requires interactive authentication and project selection. Follow these steps:

## Step 1: Link Project (Interactive)

```bash
npx vercel link
```

**When prompted:**
1. **Set up and deploy?** → Select your project: `dealership-ai-dashboard`
2. **Which scope?** → Select your organization/team
3. **Link to existing project?** → Yes
4. **What's your project's name?** → `dealership-ai-dashboard`

This creates `.vercel/project.json` with your project configuration.

## Step 2: Add Environment Variables

After linking, run the automated script:

```bash
./scripts/add-vercel-env-auto.sh
```

**Or manually add each variable:**

```bash
# Add SUPABASE_DB_PASSWORD
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD production
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD preview
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD development

# Add DATABASE_PASSWORD
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD production
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD preview
echo "Autonation2077$" | npx vercel env add DATABASE_PASSWORD development
```

## Step 3: Verify Variables

```bash
npx vercel env ls
```

You should see:
- `SUPABASE_DB_PASSWORD` (production, preview, development)
- `DATABASE_PASSWORD` (production, preview, development)

## Step 4: Redeploy

```bash
npx vercel --prod
```

## Alternative: Use Vercel Dashboard

If CLI setup is problematic, use the Dashboard:

1. Visit: https://vercel.com/dealership-ai-dashboard/settings/environment-variables
2. Add `SUPABASE_DB_PASSWORD` = `Autonation2077$` (all environments)
3. Add `DATABASE_PASSWORD` = `Autonation2077$` (all environments)
4. Save and redeploy

## Troubleshooting

### "Project not linked"
```bash
npx vercel link
# Follow interactive prompts
```

### "Not authorized"
```bash
npx vercel login
# Authenticate in browser
```

### "Cannot read properties of undefined"
- This is a Vercel CLI bug with non-interactive mode
- Use Dashboard method or run commands interactively

## ✅ Verification Checklist

- [ ] Project linked (`.vercel/project.json` exists)
- [ ] `SUPABASE_DB_PASSWORD` added to all environments
- [ ] `DATABASE_PASSWORD` added to all environments
- [ ] Variables verified with `npx vercel env ls`
- [ ] Application redeployed

