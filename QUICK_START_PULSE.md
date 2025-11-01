# 🚀 Quick Start: Pulse System V2.0

## Deploy in 3 Steps

### 1️⃣ Deploy to Production
```bash
npm run deploy
# or
vercel --prod
```

### 2️⃣ Run Database Migration
```bash
npx prisma migrate deploy
```

### 3️⃣ Test Endpoints
```bash
# Test pulse score
curl 'https://dealershipai.com/api/pulse/score?dealerId=demo-123'

# Test radar
curl 'https://dealershipai.com/api/pulse/radar?dealerId=demo-123'

# Test trends
curl 'https://dealershipai.com/api/pulse/trends?dealerId=demo-123&days=30'
```

---

## 📱 Use Components

```tsx
import { 
  PulseScoreCard, 
  PulseRadar, 
  TrendChart, 
  ScenarioBuilder 
} from '@/components/pulse';

<PulseScoreCard dealerId="dealer-123" />
```

---

## 🌐 Custom Domain (Optional)

Configure DNS at your registrar:
```
Type: CNAME
Name: dash
Value: cname.vercel-dns.com
```

Then run:
```bash
npx vercel domains add dash.dealershipai.com
```

---

## 📚 Full Documentation

- **Complete Guide**: [PULSE_SYSTEM_DEPLOYMENT_SUMMARY.md](./PULSE_SYSTEM_DEPLOYMENT_SUMMARY.md)
- **Domain Setup**: [DOMAIN_SETUP_GUIDE.md](./DOMAIN_SETUP_GUIDE.md)
- **Components**: [components/pulse/README.md](./components/pulse/README.md)

---

## ✅ What's Included

✅ 4 API endpoints (score, radar, trends, scenario)  
✅ 4 React components (fully tested)  
✅ 4 Database tables (Prisma schema)  
✅ TypeScript types & interfaces  
✅ Demo data generators  
✅ Error handling & loading states  

**Status**: 🎉 Production Ready!
