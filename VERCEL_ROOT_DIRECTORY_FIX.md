# Vercel Root Directory Fix

## ✅ Correct Setting

For **root-level Next.js apps** (like yours), the Root Directory should be **EMPTY**, not `.`

Vercel defaults to the repository root when the field is empty.

## 🔧 How to Fix

### Step 1: Open Vercel Settings

1. Go to: https://vercel.com/[your-team]/dealership-ai-dashboard/settings
2. Scroll to: "Build & Development Settings"
3. Find: "Root Directory" field

### Step 2: Clear the Field

**Option A: If field has a value**
1. Click in the "Root Directory" field
2. Select all text (Cmd+A / Ctrl+A)
3. Delete it (Backspace / Delete)
4. Leave it **completely empty**
5. Click "Save"

**Option B: If field is disabled/locked**
1. Check if there's a lock icon or "Override" button
2. Click "Override" or unlock the setting
3. Clear the field
4. Save

**Option C: If you can't edit it**
- The field might be set at the team/organization level
- Check: Vercel Dashboard → Team Settings → Projects
- Or contact Vercel support if needed

### Step 3: Verify

After clearing:
- Field should be empty (blank)
- Save the settings
- Trigger a new deployment

## 📋 What This Means

- **Empty field** = Vercel builds from repository root (`/`)
- **Your project structure** = All routes in `app/` directory (correct)
- **Build command** = Runs from root, finds `app/` automatically

## 🎯 Expected Result

After clearing the root directory:
- ✅ Build finds `app/` directory
- ✅ Routes compile correctly
- ✅ No "Module not found" errors
- ✅ Dashboard deploys successfully

## 🔍 Alternative: Check via CLI

You can also check/update via Vercel CLI:

```bash
# Check current project settings
vercel project ls

# Update project (if CLI supports it)
# Note: Root directory is typically set in dashboard only
```

## ⚠️ If Still Can't Change

If Vercel won't let you clear the field:

1. **Check project type**: Ensure it's set to "Next.js" framework
2. **Check team settings**: Root directory might be locked at team level
3. **Try creating new project**: As last resort, create new project with correct settings
4. **Contact Vercel support**: They can help with locked settings

## 📝 Notes

- For **monorepos**: Root directory would be something like `apps/dashboard` or `apps/web`
- For **root-level apps**: Root directory should be **empty**
- Vercel auto-detects Next.js from root when field is empty

---

**TL;DR**: Clear the Root Directory field completely (leave it empty), don't set it to `.`

