# Cursor AI Setup Guide for DealershipAI

## 🚀 Quick Start

### 1. Install Cursor AI
```bash
# Download from https://cursor.sh
# Install the application
```

### 2. Open Your Project
```bash
# In Cursor, open the project folder
File → Open Folder → /Users/briankramer/dealership-ai-dashboard
```

### 3. Verify Setup
Cursor should automatically detect:
- ✅ TypeScript configuration
- ✅ Next.js project structure
- ✅ Package.json dependencies
- ✅ .cursorrules file (project-specific AI rules)

## 🤖 How to Use Cursor AI

### **Chat with Your Codebase**
Press `Cmd+L` (Mac) or `Ctrl+L` (Windows) to open the AI chat:

**Example Prompts:**
```
"Explain the multi-tenant architecture in this project"
"Help me create a new tRPC router for user management"
"Review this component for security issues"
"Generate a new dashboard component following our patterns"
```

### **Inline Code Generation**
Place your cursor where you want code and press `Cmd+K` (Mac) or `Ctrl+K` (Windows):

**Example:**
```typescript
// Place cursor here and press Cmd+K
// Type: "Create a function to get dealership scores with caching"
```

### **Code Completion**
Cursor will auto-complete following your patterns:
- Multi-tenant queries
- RBAC permission checks
- Cache-first data fetching
- Error handling patterns

## 🎯 Specific Use Cases for DealershipAI

### **1. Building New Components**
```
@codebase "Create a new metric card component for AI visibility scores"
```

### **2. Adding API Endpoints**
```
@codebase "Add a new tRPC router for competitor analysis"
```

### **3. Implementing RBAC**
```
@codebase "Help me add permission checks to the user management API"
```

### **4. Database Queries**
```
@codebase "Create a query to get all dealerships for an enterprise admin"
```

### **5. Error Handling**
```
@codebase "Add proper error handling to the cache warming script"
```

## 📁 Key Files to Reference

### **Architecture Files**
- `DEALERSHIPAI-ENTERPRISE-EXPORT.md` - Complete system overview
- `backend/src/types/user.ts` - User and tenant types
- `backend/src/middleware/rbac.ts` - Permission system
- `backend/src/middleware/tenant-isolation.ts` - Multi-tenant security

### **Component Examples**
- `src/components/dashboard/DashboardLayout.tsx` - Main layout pattern
- `src/components/dashboard/MetricCard.tsx` - Reusable component pattern
- `src/components/admin/DealerList.tsx` - Admin component pattern

### **API Examples**
- `app/api/dashboard/metrics/route.ts` - API route pattern
- `backend/src/routes/analytics.ts` - Backend route pattern
- `app/api/cron/calibrate/route.ts` - Cron job pattern

### **Utility Examples**
- `src/lib/cache-manager.ts` - Caching patterns
- `src/lib/monitoring.ts` - Error tracking patterns
- `scripts/calibrate.js` - Automation script patterns

## 🔧 Development Workflow

### **1. Start with Architecture Questions**
```
"Explain how the multi-tenant system works in this codebase"
"How does RBAC prevent unauthorized access?"
"What's the caching strategy for cost optimization?"
```

### **2. Build Components Following Patterns**
```
"Create a new admin component for system health monitoring"
"Add a new metric card for review health scores"
"Build a competitor comparison chart component"
```

### **3. Implement APIs with Security**
```
"Create a new API endpoint for dealership analytics"
"Add user management endpoints with proper RBAC"
"Implement a new cron job for data aggregation"
```

### **4. Add Features with Monitoring**
```
"Add error tracking to the new component"
"Include performance monitoring for the API"
"Add logging to the automation script"
```

## 🎨 Code Generation Examples

### **Generate a New Dashboard Component**
```
@codebase "Create a new component called 'RevenueTracker' that shows monthly revenue trends with a line chart, following the same patterns as AIVisibilityChart"
```

### **Add a New API Endpoint**
```
@codebase "Create a new tRPC router called 'revenue' with a 'getMonthlyTrend' procedure that fetches revenue data for a dealership with proper tenant isolation"
```

### **Implement Caching**
```
@codebase "Add caching to the dealership scores API using the cache manager, with 24-hour TTL and geographic pooling"
```

### **Add Error Handling**
```
@codebase "Add comprehensive error handling to the review aggregation script with proper logging and monitoring"
```

## 🚨 Common Issues & Solutions

### **Issue: Cursor not understanding multi-tenancy**
**Solution:** Reference the tenant isolation middleware:
```
@codebase "Look at the tenant-isolation middleware and help me implement similar filtering in this query"
```

### **Issue: Missing RBAC checks**
**Solution:** Reference the RBAC system:
```
@codebase "Review this API endpoint and add proper permission checks using the RBAC system"
```

### **Issue: Not following caching patterns**
**Solution:** Reference the cache manager:
```
@codebase "Use the cache manager to optimize this expensive database query"
```

## 📊 Monitoring Your Progress

### **Check These Files Regularly:**
- `package.json` - Ensure dependencies are correct
- `.env.example` - Verify environment variables
- `vercel.json` - Check deployment configuration
- `src/lib/monitoring.ts` - Add metrics for new features

### **Test Your Code:**
```bash
# Run the development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/health

# Check TypeScript compilation
npm run build
```

## 🎯 Next Steps

1. **Open Cursor AI** and import this project
2. **Start with architecture questions** to understand the system
3. **Build your first component** using the patterns
4. **Add your first API endpoint** with proper security
5. **Implement monitoring** for your new features

## 💡 Pro Tips

- **Use @codebase** to reference the entire codebase in your prompts
- **Be specific** about which patterns to follow
- **Ask for explanations** when you don't understand something
- **Test incrementally** - build small features and test them
- **Follow the established patterns** - don't reinvent the wheel

**Cursor AI will help you build DealershipAI faster and more efficiently than traditional development!** 🚀
