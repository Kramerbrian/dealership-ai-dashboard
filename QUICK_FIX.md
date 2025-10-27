# 🔧 Quick Fix for Next.js Dev Server Error

## Issue
```
Error: Cannot find module '@swc/helpers'
```

## Solution

### Option 1: Run the Fix Script
```bash
chmod +x fix-dev-server.sh
./fix-dev-server.sh
```

### Option 2: Manual Fix
```bash
# 1. Stop the server
pkill -f "next dev"

# 2. Clear caches
rm -rf .next
rm -rf node_modules/.cache

# 3. Install missing dependency
npm install @swc/helpers

# 4. Restart server
npm run dev
```

### Option 3: Clean Reinstall (if above doesn't work)
```bash
# 1. Stop the server
pkill -f "next dev"

# 2. Remove node_modules
rm -rf node_modules package-lock.json

# 3. Fresh install
npm install

# 4. Start server
npm run dev
```

---

## Verify the Fix

Once the server starts, visit:
- **PLG Landing Page**: http://localhost:3000/landing/plg
- **Alternative Route**: http://localhost:3000/(landing) (the route group)

---

## Expected Behavior

1. Server starts without errors
2. Page loads with dark gradient background
3. URL input field visible
4. "Analyze Free" button works
5. Analysis completes after ~2 seconds
6. Score cards display properly
7. 5-pillar breakdown shows

---

## If Issues Persist

### Check Node Version
```bash
node -v  # Should be 18.x or higher
```

### Check Next.js Version
```bash
npm list next  # Should show 14.2.33
```

### Full Clean Rebuild
```bash
rm -rf .next node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

