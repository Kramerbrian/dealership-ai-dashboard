# DealershipAI - URL Strategy & Domain Architecture

## 🎯 Recommended URL Structure

### Primary Domain: `dealershipai.com`
**Purpose**: Main marketing site and landing page

```
dealershipai.com/
├── /                    # Landing page (marketing)
├── /features           # Feature overview
├── /pricing            # Pricing plans
├── /about              # Company information
├── /contact            # Contact form
├── /blog               # Content marketing
├── /resources          # Whitepapers, guides
└── /signup             # Registration flow
```

### Dashboard Domain: `dash.dealershipai.com`
**Purpose**: Application dashboard (existing)

```
dash.dealershipai.com/
├── /                    # Dashboard home
├── /ai-scores          # AI visibility scoring
├── /automation         # Workflow automation
├── /competitors        # Competitive analysis
├── /reports            # Reporting center
├── /settings           # Account settings
└── /admin              # Admin panel
```

### API Domain: `api.dealershipai.com`
**Purpose**: API endpoints and documentation

```
api.dealershipai.com/
├── /                    # API documentation
├── /v1/                # API version 1
├── /health             # Health checks
├── /docs               # API documentation
└── /status             # System status
```

## 🏗️ Current Implementation

### What We Built
- **Landing Page**: `dealershipai-standalone/public/landing.html`
- **Dashboard**: `dealershipai-standalone/public/dashboard.html`
- **API Server**: `dealershipai-standalone/src/api/server-simple.ts`

### URL Routing
```typescript
// Current routing structure
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/landing.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

app.get('/api/scores/:dealerId', async (req, res) => {
  // API endpoint for scores
});

app.get('/api/health', (req, res) => {
  // Health check endpoint
});
```

## 🚀 Deployment Strategy

### Option 1: Single Domain (Recommended for MVP)
```
dealershipai.com/
├── /                    # Landing page
├── /dashboard          # Application dashboard
├── /api/               # API endpoints
└── /admin              # Admin panel
```

**Benefits**:
- Simple deployment
- Single SSL certificate
- Easy DNS management
- Lower infrastructure costs

### Option 2: Multi-Domain (Recommended for Scale)
```
dealershipai.com         # Marketing site
dash.dealershipai.com    # Application dashboard
api.dealershipai.com     # API endpoints
```

**Benefits**:
- Better performance (CDN optimization)
- Separate scaling
- Enhanced security
- Professional appearance

## 📊 Landing Page Features

### Hero Section
- **Headline**: "The platform 240+ dealerships use to control their AI visibility"
- **CTA Buttons**: "Track AI Visibility" | "Admin Panel"
- **Value Proposition**: Clear, compelling messaging

### Feature Highlights
1. **AI Visibility Score**: Track visibility across 6 AI engines
2. **Competitive Intelligence**: Rank against competitors
3. **Enterprise Ready**: SOC 2 compliant with SSO, RBAC

### Social Proof
- **240+ Active Dealerships**
- **92% Data Accuracy**
- **$21.3K Average Monthly ROI**
- **6 AI Platforms Tracked**

### Pricing Tiers
- **Basic**: $0/month (10 queries)
- **Pro**: $499/month (500 queries) - Most Popular
- **Ultra**: $999/month (2000 queries)

## 🔧 Technical Implementation

### Environment Variables
```bash
# Production URLs
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dash.dealershipai.com
NEXT_PUBLIC_API_URL=https://api.dealershipai.com

# Development URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Vercel Configuration
```json
{
  "rewrites": [
    {
      "source": "/dashboard/:path*",
      "destination": "/dashboard/:path*"
    },
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/app",
      "destination": "/dashboard",
      "permanent": true
    }
  ]
}
```

## 🎯 Marketing Integration

### SEO Optimization
- **Primary Keywords**: "AI visibility", "dealership marketing", "ChatGPT optimization"
- **Meta Tags**: Optimized for automotive industry
- **Schema Markup**: Local business and software application
- **Sitemap**: Comprehensive URL structure

### Analytics Tracking
```javascript
// Google Analytics 4
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'DealershipAI - AI Visibility Platform',
  page_location: 'https://dealershipai.com'
});

// Conversion tracking
gtag('event', 'conversion', {
  send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
  value: 499.00,
  currency: 'USD'
});
```

## 📱 Mobile Optimization

### Responsive Design
- **Mobile-first approach**
- **Touch-friendly buttons**
- **Optimized images**
- **Fast loading times**

### Progressive Web App
- **Service worker**
- **Offline functionality**
- **Push notifications**
- **App-like experience**

## 🔒 Security Considerations

### SSL Certificates
- **Wildcard certificate** for `*.dealershipai.com`
- **HSTS headers**
- **Certificate transparency**

### CORS Configuration
```javascript
// API CORS settings
app.use(cors({
  origin: [
    'https://dealershipai.com',
    'https://dash.dealershipai.com',
    'https://www.dealershipai.com'
  ],
  credentials: true
}));
```

## 📈 Performance Optimization

### CDN Strategy
- **Cloudflare** for global distribution
- **Image optimization**
- **Caching headers**
- **Compression**

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## 🎉 Summary

### Recommended Approach
1. **Start with single domain** (`dealershipai.com`) for MVP
2. **Add subdomains** as you scale (`dash.dealershipai.com`, `api.dealershipai.com`)
3. **Implement landing page** with clear value proposition
4. **Optimize for conversions** with compelling CTAs
5. **Track performance** with analytics and monitoring

### Next Steps
1. **Deploy landing page** to production
2. **Set up analytics** and conversion tracking
3. **Implement A/B testing** for optimization
4. **Create content marketing** strategy
5. **Launch SEO campaign** for organic growth

**The landing page is ready to deploy and will provide a professional entry point for your DealershipAI platform.**
