# Environment Variables Setup Guide

## Required for Automation

### Generate Keys

Run this command to generate secure keys:

```bash
npm run generate:automation-keys
```

This will output secure random keys you can copy to your `.env` file.

### Manual Setup

If you prefer to generate keys manually:

```bash
# Generate AUTOMATION_API_KEY (32 bytes hex)
openssl rand -hex 32

# Generate CRON_SECRET (32 bytes hex)
openssl rand -hex 32
```

## Environment Variables

### Local Development (.env)

Create or update `.env` in your project root:

```bash
# Automation Keys (generate with: npm run generate:automation-keys)
AUTOMATION_API_KEY=your-generated-key-here
CRON_SECRET=your-generated-secret-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your data source credentials (examples)
KPI_API_KEY=your-kpi-api-key
KPI_API_URL=https://your-kpi-api.com
GOOGLE_ANALYTICS_KEY=your-ga-key
```

### Vercel Production

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables for **Production**, **Preview**, and **Development**:

   ```
   AUTOMATION_API_KEY = [generated key]
   CRON_SECRET = [generated secret]
   NEXT_PUBLIC_APP_URL = https://your-domain.com
   ```

3. **Important**: Use different keys for Production vs Development

### Environment-Specific Values

#### Development
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTOMATION_API_KEY=dev-key-here
CRON_SECRET=dev-secret-here
```

#### Staging
```bash
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
AUTOMATION_API_KEY=staging-key-here
CRON_SECRET=staging-secret-here
```

#### Production
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
AUTOMATION_API_KEY=production-key-here
CRON_SECRET=production-secret-here
```

## Security Best Practices

### ✅ DO:
- Generate unique keys for each environment
- Use strong random keys (32+ bytes)
- Store keys in environment variables only
- Rotate keys periodically
- Use different keys for dev/staging/prod

### ❌ DON'T:
- Commit keys to git
- Share keys in chat/email
- Use simple passwords as keys
- Reuse keys across environments
- Hardcode keys in source code

## Verification

### Test Local Setup

```bash
# Check if keys are set
node -e "console.log('API Key:', process.env.AUTOMATION_API_KEY ? '✅ Set' : '❌ Missing')"
node -e "console.log('Cron Secret:', process.env.CRON_SECRET ? '✅ Set' : '❌ Missing')"
```

### Test API Authentication

```bash
# Should return 401 without key
curl http://localhost:3000/api/forecast-actual/automate

# Should work with key
curl -X POST http://localhost:3000/api/forecast-actual/automate \
  -H "Authorization: Bearer YOUR_AUTOMATION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"forecastId":"test","actualScores":{"AIV":80}}'
```

## Quick Setup Checklist

- [ ] Run `npm run generate:automation-keys`
- [ ] Copy keys to `.env` file
- [ ] Add keys to Vercel environment variables
- [ ] Verify keys are not in `.gitignore` (they shouldn't be!)
- [ ] Test authentication locally
- [ ] Deploy and verify production keys

## Troubleshooting

### "Unauthorized" Errors
- Check `AUTOMATION_API_KEY` is set correctly
- Verify Authorization header format: `Bearer YOUR_KEY`
- Ensure key matches in both systems

### Cron Not Running
- Check `CRON_SECRET` is set in Vercel
- Verify cron schedule in `vercel.json`
- Check Vercel function logs

### API Calls Failing
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check network connectivity
- Review server logs for errors

