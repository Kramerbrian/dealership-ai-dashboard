# Vercel CLI Team ID Issue

## ⚠️ Current Status

**Project Linked**: ✅ Yes
- Project ID: `prj_HRquUb6CYEdBjyZe2SkcjyYnEqV9`
- Org ID: `brian-kramers-projects`

**Issue**: CLI requires `teamId` parameter but the linked project uses `orgId`

## 🔍 Problem

The Vercel CLI is returning:
```
Error: You must supply a `teamId` query parameter or set your default team
```

This happens because:
- The project is linked with `orgId: "brian-kramers-projects"`
- The CLI needs a `teamId` (which may be different from orgId)
- The CLI cannot automatically resolve the team from the org

## ✅ Solutions

### Option 1: Use Vercel Dashboard (Recommended - Fastest)

**No CLI needed - fastest method:**

1. Visit: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
2. Add `SUPABASE_DB_PASSWORD` = `Autonation2077$` (all environments)
3. Add `DATABASE_PASSWORD` = `Autonation2077$` (all environments)
4. Save and redeploy

### Option 2: Set Default Team (If you have team ID)

If you know the team ID, you can set it as default:

```bash
# First, get your teams
npx vercel teams ls

# Then set default team (replace TEAM_ID with actual ID)
npx vercel teams set-default TEAM_ID

# Then add environment variables
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD production
```

### Option 3: Use Team Flag

Try using the team flag with the org ID:

```bash
echo "Autonation2077$" | npx vercel env add SUPABASE_DB_PASSWORD production --team=brian-kramers-projects
```

## 📋 Current Project Info

- **Deployment**: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/HRquUb6CYEdBjyZe2SkcjyYnEqV9
- **Project ID**: `prj_HRquUb6CYEdBjyZe2SkcjyYnEqV9`
- **Org ID**: `brian-kramers-projects`
- **Linked**: ✅ Yes (`.vercel/project.json` exists)

## 🚀 Recommended Action

**Use the Dashboard method** - it's the fastest and most reliable:
- No CLI authentication issues
- No team ID resolution needed
- Immediate results
- Can verify variables immediately

Visit: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables

