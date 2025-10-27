# 🔧 Fix @swc/helpers Error - Step by Step

## Quick Fix (Copy & Paste in Terminal)

```bash
# Step 1: Stop the current server (press Ctrl+C in the terminal running npm run dev)

# Step 2: Run these commands in your terminal:
pkill -f "next dev"
rm -rf .next node_modules/.cache
npm install @swc/helpers --save-dev
npm run dev
```

---

## Detailed Steps

### 1. Stop the Dev Server
In the terminal where `npm run dev` is running:
- Press **Ctrl+C**
- Wait for it to stop

### 2. Navigate to Project Directory
```bash
cd /Users/stephaniekramer/dealership-ai-dashboard
```

### 3. Run the Fix Commands
```bash
# Kill any remaining Next.js processes
pkill -f "next dev"

# Remove caches
rm -rf .next
rm -rf node_modules/.cache

# Install missing dependency
npm install @swc/helpers --save-dev

# Start the server
npm run dev
```

### 4. Access the PLG Landing Page

**Once the server starts, visit:**
- **Main PLG Page**: http://localhost:3000/landing/plg
- **Route Group**: http://localhost:3000/(landing)

---

## What You'll See

✅ Server starts without errors  
✅ PLG landing page loads successfully  
✅ Dark gradient background  
✅ URL analyzer input  
✅ "Analyze Free" button  

---

## If It Still Doesn't Work

### Option A: Complete Reinstall
```bash
pkill -f "next dev"
rm -rf .next node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

### Option B: Check Node Version
```bash
node -v  # Should be 18.x or higher
npm -v    # Should be 9.x or higher
```

### Option C: Use the Alternative Route
If `/landing/plg` doesn't work, try:
```
http://localhost:3000/(landing)
```
This uses the route group which has the working components.

---

## Summary

**The PLG landing page is ready:**
- ✅ Component created: `components/landing/plg/advanced-plg-landing.tsx`
- ✅ Page routing updated: `app/landing/plg/page.tsx`
- ✅ PostCSS configured
- ⏳ Just need to fix @swc/helpers dependency

**Run the commands above to fix it!**

