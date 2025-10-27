# 🚗 DealershipAI Chrome Extension

A powerful Chrome extension that provides real-time AI visibility analysis for automotive dealerships. Built with Plasmo, React, and Clerk authentication.

## ✨ Features

### 🔐 **Authentication**
- Secure login with Clerk
- User management and preferences
- Session persistence

### 🧠 **AI Analysis**
- Real-time AI visibility scoring
- Page-by-page analysis
- Competitive intelligence
- Quick wins identification

### 🎯 **Smart Detection**
- Auto-detects dealership websites
- Analyzes schema markup, meta tags, and content
- Provides instant feedback

### ⚡ **Quick Actions**
- One-click analysis
- Automated fixes suggestions
- Competitive comparison
- Performance insights

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
pnpm install
```

### 2. **Set Up Environment**
```bash
# Copy environment template
cp env-template.txt .env.local

# Edit .env.local and add your keys:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - NEXT_PUBLIC_API_URL
```

### 3. **Development**
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Package extension
pnpm package
```

### 4. **Load Extension**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` folder

## 🏗️ Architecture

### **Components**
- **Popup** (`src/popup.tsx`) - Main extension interface
- **Content Script** (`src/content.tsx`) - Page analysis and injection
- **Background** (`src/background.ts`) - Extension logic and messaging

### **Features**
- **Authentication** - Clerk integration for secure access
- **AI Analysis** - Real-time scoring and insights
- **Smart Injection** - Contextual UI elements on dealership sites
- **Storage** - Chrome storage for user preferences and data

## 🎨 UI Components

### **Popup Interface**
- Clean, modern design with TailwindCSS
- Real-time AI score display
- Quick action buttons
- Upgrade prompts for Pro features

### **Content Injection**
- Floating AI badge with score
- Quick wins panel
- Contextual suggestions
- Non-intrusive design

## 🔧 Configuration

### **Manifest Permissions**
```json
{
  "host_permissions": ["https://*/*", "http://*/*"],
  "permissions": ["storage", "tabs", "contextMenus", "activeTab"]
}
```

### **Dealership Detection**
Automatically detects dealership sites based on:
- Domain keywords (dealership, auto, car, etc.)
- Brand names (Honda, Toyota, Ford, etc.)
- URL patterns

## 📊 AI Analysis

### **Scoring Factors**
- **Schema Markup** (+15 points)
- **Meta Descriptions** (+10 points)
- **Open Graph Tags** (+8 points)
- **Twitter Cards** (+5 points)
- **Structured Data** (+12 points)
- **Content Quality** (images, links, headings)

### **Quick Wins**
- Add missing schema markup
- Optimize meta descriptions
- Improve page loading speed
- Enhance structured data

## 🚀 Deployment

### **Development**
```bash
pnpm dev
# Extension loads in Chrome with hot reload
```

### **Production**
```bash
pnpm build
# Creates optimized build in build/chrome-mv3-prod
```

### **Publishing**
```bash
pnpm package
# Creates .zip file for Chrome Web Store
```

## 🔐 Security

- **CSP** - Content Security Policy for safe execution
- **Permissions** - Minimal required permissions
- **Authentication** - Secure Clerk integration
- **Data** - Local storage only, no external data collection

## 📱 Browser Support

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Brave
- ✅ Other Chromium browsers

## 🎯 Use Cases

### **Dealership Managers**
- Monitor AI visibility across all pages
- Get instant feedback on improvements
- Track competitive position

### **Marketing Teams**
- Optimize content for AI platforms
- Identify quick wins
- Measure impact of changes

### **SEO Specialists**
- Technical SEO analysis
- Schema markup optimization
- Performance monitoring

## 🔄 Integration

### **With DealershipAI Dashboard**
- Syncs with main dashboard
- Real-time data updates
- Unified user experience

### **With Analytics**
- Google Analytics integration
- Custom event tracking
- Performance metrics

## 📈 Roadmap

### **Phase 1** ✅
- Basic AI analysis
- Authentication
- Content injection

### **Phase 2** 🚧
- Real-time competitive analysis
- Automated fixes
- Advanced insights

### **Phase 3** 📋
- Team collaboration
- Advanced reporting
- API integrations

## 🛠️ Development

### **Tech Stack**
- **Plasmo** - Extension framework
- **React** - UI components
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Clerk** - Authentication

### **Scripts**
```bash
pnpm dev          # Development with hot reload
pnpm build        # Production build
pnpm package      # Create distribution package
pnpm lint         # Code linting
pnpm type-check   # TypeScript checking
```

## 📞 Support

- **Documentation** - [docs.dealershipai.com](https://docs.dealershipai.com)
- **Support** - [support@dealershipai.com](mailto:support@dealershipai.com)
- **Community** - [Discord](https://discord.gg/dealershipai)

---

**Built with ❤️ for the automotive industry**