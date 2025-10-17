# 🚀 DealershipAI - Cursor IDE Configuration

## Quick Start Guide

### 1. Open Project in Cursor
```bash
cursor dealership-ai
# or
cursor dealership-ai.code-workspace
```

### 2. Install Recommended Extensions
Cursor will prompt to install:
- TailwindCSS IntelliSense
- ESLint
- Prettier
- Path Intellisense

### 3. Start Coding with AI
- **Cmd+K** - Open command palette
- **Cmd+L** - Generate code with AI
- **Cmd+I** - Inline AI edit
- **Cmd+Shift+P** - AI chat

## 🎯 How to Use AI Prompts

### Generate New Features
1. Press **Cmd+L**
2. Type your request: "Create pricing card component with Cupertino aesthetic"
3. AI generates complete, production-ready code
4. Test and deploy

### Debug Issues
1. Select problematic code
2. Press **Cmd+I**
3. Describe the issue: "Fix this API error"
4. AI provides specific solution

### Learn While Building
1. Select code you want to understand
2. Press **Cmd+Shift+P**
3. Ask: "Explain this code and suggest improvements"
4. Get detailed explanation with alternatives

## 📚 Prompt Library Usage

### Feature Development
Use prompts from `.cursor/prompt-library.md`:

```
Create a competitor comparison widget for dashboard that:
1. Displays up to 5 competitors in a table
2. Shows AI visibility scores for each
3. Highlights your dealership's row
4. Includes sorting by column
5. Mobile responsive
6. Cupertino aesthetic
```

### Quick Commands
For rapid development:

- "Add error handling"
- "Make responsive"
- "Add loading state"
- "Optimize performance"
- "Add TypeScript types"

## 🎨 Rendering Strategies

### When to Use Each Method

**SSR (Server-Side Rendering)**
- ✅ SEO required
- ✅ Dynamic data
- ✅ User-specific content
- ❌ Not for static content

**SSG (Static Site Generation)**
- ✅ Marketing pages
- ✅ Blog posts
- ✅ Documentation
- ❌ Not for user-specific data

**ISR (Incremental Static Regeneration)**
- ✅ E-commerce
- ✅ News sites
- ✅ Content that updates occasionally
- ❌ Not for real-time data

**CSR (Client-Side Rendering)**
- ✅ Dashboards
- ✅ Interactive apps
- ✅ Behind authentication
- ❌ Not for SEO

### Decision Tree
```
Need SEO?
├─ Yes → Dynamic data?
│   ├─ Yes → SSR
│   └─ No → SSG
└─ No → Behind auth?
    ├─ Yes → CSR
    └─ No → ISR
```

## ✂️ Code Snippets

### Available Snippets
- **npage** - Complete Next.js page template
- **napi** - API route with error handling
- **ncomp** - Reusable React component
- **nprotected** - Protected route with auth

### Usage
1. Type snippet prefix (e.g., `npage`)
2. Press **Tab**
3. Fill in placeholders
4. Customize as needed

## 🎯 Project-Specific Guidance

### DealershipAI Business Model
- **Cost**: $0.15/dealer/month
- **Revenue**: $499/dealer/month
- **Margin**: 99.97%

### Key Principles
1. **Server-side logic** - Protect business logic
2. **Minimal dependencies** - Keep bundle small
3. **Demo-ready data** - Always have working examples
4. **Cupertino aesthetic** - Apple-inspired design
5. **Fast deployment** - Optimize for Vercel

### Architecture Patterns
- **API Routes** - All business logic server-side
- **Protected Routes** - NextAuth integration
- **Synthetic Data** - Realistic demo data
- **Error Boundaries** - Graceful failure handling
- **Loading States** - Better UX

## 📊 Performance Optimization

### Image Optimization
```javascript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={60}
  priority
  className="rounded-lg"
/>
```

### Code Splitting
```javascript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

### Caching
```javascript
// API route with caching
export async function GET() {
  const data = await fetchData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

## 🔐 Security Best Practices

### Environment Variables
```bash
# ✅ GOOD - Server-side only
SECRET_API_KEY=sk_live_1234567890

# ❌ BAD - Client exposure
NEXT_PUBLIC_SECRET_KEY=sk_live_1234567890
```

### Input Validation
```javascript
export async function POST(req: Request) {
  const { email } = await req.json();
  
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Valid email required' }, 
      { status: 400 }
    );
  }
  
  // Process validated input
}
```

### Authentication
```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <ProtectedContent user={session.user} />;
}
```

## 🐛 Debugging with AI

### Common Issues

**API 500 Errors**
```
Debug this API error: [paste code]
```
AI checks: validation, env vars, error handling, CORS

**Authentication Issues**
```
Fix NextAuth callback problems
```
AI verifies: URLs, env vars, provider config, redirects

**Performance Problems**
```
Optimize this slow component
```
AI suggests: memo, useMemo, code splitting, image optimization

**Build Failures**
```
Fix Vercel build errors
```
AI checks: dependencies, env vars, TypeScript errors, imports

## 💡 Pro Tips

### 1. Be Specific in Prompts
❌ "Add a button"  
✅ "Add a gradient button with rounded-full, cyan→blue gradient, hover shadow, px-6 py-3 padding"

### 2. Reference Existing Code
"Create a card component like FeatureCard but for pricing tiers"

### 3. Iterate and Improve
1. "Create pricing section"
2. "Add hover animations"
3. "Make it responsive"
4. "Add popular badge to middle tier"

### 4. Use Context
"Fix this error using the same pattern as in pages/dashboard.js"

### 5. Learn Continuously
"Why did you choose this approach? What are the alternatives?"

## 🚀 Productivity Metrics

### Development Speed
| Task | Traditional | With Cursor | Speedup |
|------|------------|-------------|---------|
| New page | 45 min | 5 min | 9x |
| API endpoint | 30 min | 3 min | 10x |
| Component | 20 min | 2 min | 10x |
| Debugging | 60 min | 10 min | 6x |
| **Average** | **~40 min** | **~5 min** | **8x** |

### Real Impact
- **1 week of work** → **1 day**
- **1 month project** → **1 week**
- **More time for sales/growth**

## 🎯 Success Path

### Week 1: Learning
- Get familiar with AI prompts
- Try different command types
- Build first custom feature
- **Goal**: 2-3x productivity

### Week 2-4: Acceleration
- Master prompt library
- Develop AI intuition
- Build complex features
- **Goal**: 5-8x productivity

### Month 2+: Mastery
- Create custom prompts
- Optimize workflows
- Maximum efficiency
- **Goal**: 10-15x productivity

## 📞 Support & Resources

### Documentation
- `.cursor/prompt-library.md` - 150+ ready-to-use prompts
- `.cursor/nextjs-rendering-guide.md` - Rendering strategies
- `README.md` - Project overview
- `DEPLOYMENT-GUIDE.md` - Deployment steps

### Keyboard Shortcuts
- **Cmd+K** - Command palette
- **Cmd+L** - Generate code
- **Cmd+I** - Inline edit
- **Cmd+Shift+P** - AI chat
- **Cmd+.** - Quick fix
- **Cmd+Shift+F** - Search project

### Extensions
- TailwindCSS IntelliSense
- ESLint
- Prettier
- Path Intellisense
- TypeScript support

---

## 🎉 Ready to 10x Your Productivity?

```bash
cursor dealership-ai
# Start building with AI superpowers ✨
```

**The future is AI-powered. You're ready to experience it.** 🚀
