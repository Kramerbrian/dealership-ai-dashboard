# Google Business Profile (GBP) Integration Setup Guide

## Overview

This guide walks you through setting up the Google Business Profile API integration for DealershipAI, enabling real-time NAP (Name, Address, Phone) validation.

---

## Prerequisites

- Google Cloud Platform account
- Access to Google Business Profile account
- Dealership has a verified GBP listing

---

## Step 1: Enable Google My Business API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing project
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google My Business API"
5. Click **Enable**

---

## Step 2: Create Service Account

1. In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill in details:
   - **Name:** `dealershipai-gbp-client`
   - **Description:** `Service account for GBP API access`
4. Click **Create and Continue**
5. Grant role: **Google My Business API Admin**
6. Click **Done**

---

## Step 3: Generate Service Account Key

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Select **JSON** format
5. Click **Create**
6. Save the downloaded JSON file securely

**⚠️ SECURITY:** Never commit this file to version control!

---

## Step 4: Configure Environment Variables

### Local Development (.env.local)

```bash
# Google Business Profile Integration
GBP_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"dealershipai-gbp-client@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# Your GBP Account ID (find this in GBP dashboard URL)
GBP_ACCOUNT_ID=1234567890
```

### Production (Vercel)

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add `GBP_SERVICE_ACCOUNT` with the JSON content (as a single line)
3. Add `GBP_ACCOUNT_ID`
4. Click **Save**

---

## Step 5: Install Required Package

```bash
npm install googleapis
```

Update your `package.json`:

```json
{
  "dependencies": {
    "googleapis": "^134.0.0"
  }
}
```

---

## Step 6: Apply Database Migration

Run the Prisma migration to add GBP fields:

```bash
npx prisma generate
npx prisma db push
```

This adds the following fields to `Dealership` model:
- `gbpLocationId` - Google Business Profile location ID
- `napValidation` - JSON string of validation results
- `napConsistencyScore` - 0-1 score
- `lastNAPCheck` - Timestamp of last check
- `userId` - Owner user ID
- `address` - Street address
- `zipCode` - Postal code

---

## Step 7: Link GBP Locations to Dealers

### Option A: Via API

```bash
curl -X POST http://localhost:3000/api/gbp/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "dealerId": "dealer-cuid",
    "locationId": "ChIJ..."
  }'
```

### Option B: Via Admin UI (Recommended)

1. Navigate to dealer settings
2. Click "Link GBP Location"
3. Select from list of available locations
4. Click "Connect"

---

## Step 8: Test NAP Validation

### Via API

```bash
curl -X POST http://localhost:3000/api/gbp/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "dealerId": "dealer-cuid",
    "crossPlatformCheck": true
  }'
```

### Via Dashboard

1. Go to dealer dashboard
2. Find "NAP Validation" card
3. Click "Run NAP Validation"
4. View results and recommendations

---

## Finding Your GBP Location ID

### Method 1: Via API

```bash
curl http://localhost:3000/api/gbp/locations \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Response will include all locations with their IDs:

```json
{
  "locations": [
    {
      "locationId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "title": "Germain Toyota of Naples",
      "address": {...}
    }
  ]
}
```

### Method 2: From GBP Dashboard URL

1. Go to https://business.google.com/locations
2. Select your location
3. Look at the URL: `https://business.google.com/locations/[LOCATION_ID]`
4. Copy the `LOCATION_ID` part

---

## Understanding NAP Validation Results

### Consistency Score

- **90-100%**: Excellent - All NAP data matches
- **70-89%**: Good - Minor discrepancies
- **Below 70%**: Needs attention - Significant mismatches

### Common Issues

1. **Name Mismatch**
   - Different business name on website vs GBP
   - Extra punctuation or legal suffixes
   - **Fix:** Update to match exactly

2. **Address Format**
   - Suite/Unit numbers missing
   - Abbreviations (St vs Street)
   - **Fix:** Use consistent format everywhere

3. **Phone Number**
   - Different formatting (+1, dashes, parentheses)
   - Old number still listed
   - **Fix:** Update all platforms with current number

---

## Automated NAP Monitoring

### Set Up Cron Job (Vercel)

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/nap-check",
    "schedule": "0 2 * * *"
  }]
}
```

Create cron endpoint at `app/api/cron/nap-check/route.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { GBPClient } from '@/lib/integrations/gbp-client';

export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const dealers = await prisma.dealership.findMany({
    where: {
      isActive: true,
      gbpLocationId: { not: null }
    }
  });

  const gbpClient = new GBPClient();

  for (const dealer of dealers) {
    if (!dealer.gbpLocationId) continue;

    const validation = await gbpClient.validateNAP(dealer.gbpLocationId, {
      name: dealer.name,
      address: `${dealer.address}, ${dealer.city}, ${dealer.state} ${dealer.zipCode}`,
      phone: dealer.phone || ''
    });

    await prisma.dealership.update({
      where: { id: dealer.id },
      data: {
        napValidation: JSON.stringify(validation),
        napConsistencyScore: validation.confidenceScore,
        lastNAPCheck: new Date()
      }
    });

    // Send alert if consistency drops below 70%
    if (validation.confidenceScore < 0.7) {
      // TODO: Send alert to dealer via email/Slack
      console.log(`[NAP Alert] ${dealer.name} consistency: ${validation.confidenceScore}`);
    }
  }

  return Response.json({ checked: dealers.length });
}
```

---

## Troubleshooting

### Error: "No credentials provided"

**Solution:** Ensure `GBP_SERVICE_ACCOUNT` environment variable is set correctly.

### Error: "Permission denied"

**Solution:**
1. Verify service account has "Google My Business API Admin" role
2. Ensure you've shared GBP account access with the service account email
3. Check that the API is enabled in Google Cloud Console

### Error: "Location not found"

**Solution:**
1. Verify the `locationId` is correct
2. Ensure the location is claimed and verified in GBP
3. Check that service account has access to this location

### Mock Data Showing Instead of Real Data

**Solution:**
- If `GBP_SERVICE_ACCOUNT` is not set, the client runs in mock mode
- Set the environment variable and restart the server

---

## API Endpoints Reference

### POST /api/gbp/validate

Validate NAP for a dealer.

**Request:**
```json
{
  "dealerId": "cuid",
  "locationId": "optional-override",
  "expectedNAP": {
    "name": "Optional expected name",
    "address": "Optional expected address",
    "phone": "Optional expected phone"
  },
  "crossPlatformCheck": false
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "isConsistent": true,
    "name": { "value": "...", "isValid": true },
    "address": { "value": "...", "isValid": true },
    "phone": { "value": "...", "isValid": true },
    "confidenceScore": 0.95
  }
}
```

### GET /api/gbp/validate?dealerId=xxx

Get last validation result.

### GET /api/gbp/locations

List all GBP locations for authenticated user.

### POST /api/gbp/locations

Link a GBP location to a dealer.

---

## Cost Considerations

- **Google My Business API:** Free for most use cases
- **API Quotas:**
  - 1,500 queries per day (standard)
  - Can request increase if needed

**Recommendation:** Run validation checks once per week per dealer to stay well within quota.

---

## Security Best Practices

1. **Never commit credentials**
   - Add service account JSON to `.gitignore`
   - Use environment variables only

2. **Restrict service account permissions**
   - Only grant "Google My Business API Admin" role
   - Don't use owner/editor roles

3. **Rotate keys periodically**
   - Create new service account key every 90 days
   - Delete old keys after transition

4. **Monitor usage**
   - Set up Cloud Console alerts for API quota usage
   - Track failed authentication attempts

---

## Next Steps

After setting up GBP integration:

1. ✅ **Week 1 Complete:** GBP API Integration
2. ⏭️ **Week 2:** Build real AIV scoring (Gemini + ChatGPT crawlers)
3. ⏭️ **Week 3:** Connect CRM integration (Elead API)
4. ⏭️ **Week 4:** Enable auto-fix + multi-dealer support

---

## Support

For issues with GBP integration:

- Review [Google My Business API Documentation](https://developers.google.com/my-business)
- Check [API Status](https://status.cloud.google.com/)
- Contact: devops@dealershipai.com

---

**Last Updated:** 2025-11-01
**Version:** 1.0
