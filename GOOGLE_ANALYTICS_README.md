# Google Analytics Data API Integration

Real-time analytics integration for DealershipAI Dashboard using Google Analytics Data API.

## 🚀 Quick Start

```bash
# 1. Install dependencies (already done)
npm install

# 2. Configure credentials in .env.local
cp .env.example .env.local
# Add your GA_* variables

# 3. Test locally
npm run test:analytics

# 4. Deploy to production
./scripts/setup-vercel-analytics-env.sh
git push origin main
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [**GOOGLE_ANALYTICS_INTEGRATION_SUMMARY.md**](./GOOGLE_ANALYTICS_INTEGRATION_SUMMARY.md) | Complete overview of implementation |
| [**GOOGLE_ANALYTICS_SETUP.md**](./GOOGLE_ANALYTICS_SETUP.md) | Detailed setup instructions |
| [**GOOGLE_ANALYTICS_QUICKSTART.md**](./GOOGLE_ANALYTICS_QUICKSTART.md) | 5-minute quick start guide |
| [**GOOGLE_ANALYTICS_DEPLOYMENT.md**](./GOOGLE_ANALYTICS_DEPLOYMENT.md) | Production deployment guide |

## 🎯 What's Included

- ✅ Google Analytics Data API client (`@google-analytics/data`)
- ✅ Type-safe analytics client library
- ✅ Test API endpoint (`/api/test-analytics`)
- ✅ Comprehensive test script
- ✅ Deployment automation
- ✅ Full documentation

## 💻 Usage

```typescript
import { getAnalyticsClient } from '@/lib/analytics/google-analytics-client';

const client = getAnalyticsClient();
const activeUsers = await client.getActiveUsers('30daysAgo', 'today');
```

## 🔧 Environment Variables

Required in `.env.local` and Vercel:

```bash
GA_PROPERTY_ID=123456789
GA_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GA_PROJECT_ID=your-gcp-project-id
```

## 📊 Available Commands

```bash
npm run test:analytics         # Run comprehensive tests
npm run analytics:test-api     # Test API endpoint
npm run dev                    # Start dev server
```

## 📝 Files Created

```
lib/analytics/
  └── google-analytics-client.ts        # Main client library

app/api/
  └── test-analytics/
      └── route.ts                      # Test endpoint

scripts/
  ├── test-google-analytics.ts          # Test script
  └── setup-vercel-analytics-env.sh     # Deployment helper

Documentation:
  ├── GOOGLE_ANALYTICS_INTEGRATION_SUMMARY.md
  ├── GOOGLE_ANALYTICS_SETUP.md
  ├── GOOGLE_ANALYTICS_QUICKSTART.md
  ├── GOOGLE_ANALYTICS_DEPLOYMENT.md
  └── GOOGLE_ANALYTICS_README.md (this file)
```

## ✅ Status

**Implementation**: Complete ✓
**Testing**: Ready ✓
**Documentation**: Complete ✓
**Production**: Ready for deployment ✓

## 🚦 Next Steps

1. **Setup**: Follow [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md)
2. **Test**: Run `npm run test:analytics`
3. **Deploy**: Follow [GOOGLE_ANALYTICS_DEPLOYMENT.md](./GOOGLE_ANALYTICS_DEPLOYMENT.md)
4. **Integrate**: Use the client in your dashboard components

## 📞 Support

- **Setup issues**: See [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md)
- **Deployment issues**: See [GOOGLE_ANALYTICS_DEPLOYMENT.md](./GOOGLE_ANALYTICS_DEPLOYMENT.md)
- **API reference**: [Google Analytics Data API Docs](https://developers.google.com/analytics/devguides/reporting/data/v1)

---

**Ready to deploy!** Start with [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md) for step-by-step instructions.
