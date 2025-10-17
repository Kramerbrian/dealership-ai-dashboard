# Quick Activation Steps for dash.dealershipai.com

## ⚡ 3-Step Activation Process

### Step 1: Disable Deployment Protection ⏱️ 1 minute
```
🔗 https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/deployment-protection

Action: Click "Edit" → Disable Protection → Save
```

### Step 2: Add Domain ⏱️ 2 minutes
```
🔗 https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains

Action:
1. If dash.dealershipai.com is shown elsewhere, remove it first
2. Click "Add Domain"
3. Enter: dash.dealershipai.com
4. Follow Vercel's DNS instructions if needed
```

### Step 3: Update DNS (if required) ⏱️ 5 minutes + propagation
```
DNS Provider: (Your registrar)

Record Type: CNAME
Name: dash
Value: cname.vercel-dns.com
TTL: Auto
```

## ✅ Verify Activation

```bash
./verify-dash-activation.sh
```

Or manually visit: https://dash.dealershipai.com/dash

## 🎯 All 7 Tabs Available

1. 📊 Overview - Executive metrics
2. 🤖 AI Health - Service monitoring
3. 🌐 Website - Performance
4. 🔍 Schema - Markup management
5. ⭐ Reviews - Multi-platform reviews
6. ⚔️ War Room - Competitive intel
7. ⚙️ Settings - Configuration

## 🚨 Current Issues

❌ **401 Error**: Deployment protection enabled
❌ **404 Error**: Domain not assigned to project

## 📱 Quick Access Links

| Resource | URL |
|----------|-----|
| **Target Dashboard** | https://dash.dealershipai.com/dash |
| **Staging** | https://dealership-ai-dashboard-brian-kramers-projects.vercel.app/dash |
| **Deployment Protection** | [Click here](https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/deployment-protection) |
| **Domain Settings** | [Click here](https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains) |
| **Full Guide** | [DASH_ACTIVATION_GUIDE.md](./DASH_ACTIVATION_GUIDE.md) |

## ⏱️ Total Time: ~10 minutes
(Plus DNS propagation: 5-60 minutes)

---

✅ After completion, all tabs will be accessible at https://dash.dealershipai.com/dash
