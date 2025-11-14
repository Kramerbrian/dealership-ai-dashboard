# Reddit OAuth Setup (Path B)

## Overview

This project uses **Reddit OAuth2 script flow** (Path B) for pulling UGC data into the dashboard. This is the correct approach - we do NOT use the Devvit CLI token for dashboard data.

## Why Path B?

- **Devvit token** (`~/.devvit/token`) is only for CLI/Devvit app runtime
- **Reddit OAuth** is for backend API access to Reddit's data
- Cleaner architecture: Reddit API → Our Backend → Dashboard

## Setup Steps

### 1. Create Reddit API App

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Choose "script" type
4. Fill in:
   - **Name**: `dealershipAI-ugc-scoreboard`
   - **Description**: UGC data collection for dealership dashboard
   - **Redirect URI**: `http://localhost:3000` (for script flow, this can be localhost)
5. Save and note your:
   - **Client ID** (under the app name)
   - **Client Secret** (the "secret" field)

### 2. Set Environment Variables

Add to `.env.local`:

```bash
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USER_AGENT=dealershipAI-ugc-scoreboard/1.0 by your-reddit-username
```

Add to **Vercel** (Project Settings → Environment Variables):

- `REDDIT_CLIENT_ID` (Production, Preview, Development)
- `REDDIT_CLIENT_SECRET` (Production, Preview, Development)
- `REDDIT_USER_AGENT` (Production, Preview, Development)

### 3. Implementation

The Reddit OAuth client is in `lib/reddit/reddit-oauth-client.ts`:

- Uses OAuth2 client credentials flow
- Automatically handles token refresh
- Searches Reddit for dealership mentions
- Returns structured post data

### 4. API Endpoint

`/api/ugc/reddit` uses the OAuth client:

```bash
GET /api/ugc/reddit?dealershipName=Germain%20Toyota&location=Naples%20FL&limit=25
```

### 5. Rate Limits

- **Unauthenticated**: 60 requests/minute
- **OAuth (script)**: Higher limits (varies by account)
- **Caching**: Responses cached for 5 minutes

## What NOT to Do

❌ **Don't** try to read `~/.devvit/token` from your app  
❌ **Don't** use Devvit token for dashboard data  
❌ **Don't** commit Reddit credentials to Git  

✅ **Do** use Reddit OAuth for backend API access  
✅ **Do** store credentials in environment variables  
✅ **Do** use Devvit separately for Reddit-side tools (if needed)

## Testing

```bash
# Test the endpoint locally
curl "http://localhost:3000/api/ugc/reddit?dealershipName=Toyota&limit=10"
```

## Next Steps

1. Create Reddit script app
2. Set environment variables
3. Test `/api/ugc/reddit` endpoint
4. Integrate into UGC dashboard
5. Set up cron job for periodic updates (optional)

