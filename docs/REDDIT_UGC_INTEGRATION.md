# Reddit UGC Integration Guide

## Overview

Reddit is integrated as a data source for the UGC dashboard, pulling posts, comments, and engagement metrics related to dealerships.

## Installation

### 1. Devvit CLI (Development Dependency)

```bash
npm install --save-dev devvit@latest
```

### 2. Devvit API Packages

```bash
npm install @devvit/public-api @devvit/plugin-reddit-api
```

### 3. Environment Variables

**Required:**
- `REDDIT_DEVVIT_PROJECT_ID` - Your Devvit project ID (already set)

**Optional (for authenticated API access):**
- `REDDIT_CLIENT_ID` - Reddit OAuth client ID
- `REDDIT_CLIENT_SECRET` - Reddit OAuth client secret

## API Endpoints

### `/api/ugc/reddit`

Fetches Reddit UGC data for a dealership.

**GET** `/api/ugc/reddit?dealershipName=Germain%20Toyota&location=Naples%20FL&limit=25`

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 72,
    "recent_reviews_90d": 15,
    "issues": [],
    "redditMentions": 15,
    "redditEngagement": 1240,
    "topSubreddits": ["r/askcarsales", "r/cars", "r/toyota"],
    "reddit": {
      "totalMentions": 15,
      "recentPosts": [...],
      "topSubreddits": [...],
      "engagementScore": 65
    },
    "raw": {
      "posts": [...],
      "comments": [...]
    }
  }
}
```

## Components

### `RedditUGCFeed`

**Location:** `components/ugc/RedditUGCFeed.tsx`

**Usage:**
```tsx
import { RedditUGCFeed } from '@/components/ugc/RedditUGCFeed';

<RedditUGCFeed 
  dealershipName="Germain Toyota"
  location="Naples, FL"
  limit={10}
/>
```

**Features:**
- Displays Reddit posts mentioning the dealership
- Shows engagement stats (upvotes, comments, upvote ratio)
- Links to original Reddit posts
- Shows top subreddits where dealership is mentioned
- Calculates engagement score

## Integration with UGC Dashboard

### Current UGC Structure

The UGC dashboard expects:
```typescript
{
  score: number;              // 0-100 UGC health score
  recent_reviews_90d: number; // Count of recent mentions
  issues: string[];           // Issues to address
}
```

### Reddit Data Transformation

Reddit data is transformed to match this structure:
- **score**: Calculated from engagement (0-100)
- **recent_reviews_90d**: Count of posts in last 90 days
- **issues**: Generated if engagement is low or presence is limited

## CLI Commands

### Login to Reddit

```bash
npx devvit login
```

### View Your Apps

```bash
npx devvit list apps
```

### Upload Your App

```bash
npx devvit upload
```

### Playtest

```bash
npx devvit playtest
```

### View Logs

```bash
npx devvit logs r/yoursubreddit
```

## Data Flow

1. **User visits UGC dashboard** → Component loads
2. **Component calls** `/api/ugc/reddit?dealershipName=...`
3. **API endpoint** uses `searchRedditForDealership()` from `lib/reddit/devvit-client.ts`
4. **Reddit API** returns posts/comments matching dealership name
5. **Data transformed** to UGC format via `transformRedditToUGC()`
6. **Component displays** Reddit feed with posts, stats, and engagement metrics

## Reddit API Rate Limits

- **Unauthenticated**: 60 requests per minute
- **Authenticated**: Higher limits (requires OAuth)
- **Caching**: Responses cached for 5 minutes (300s)

## Example Integration

```tsx
// In UGC dashboard component
import { RedditUGCFeed } from '@/components/ugc/RedditUGCFeed';

export function UGCDashboard({ dealershipName, location }) {
  return (
    <div>
      <h2>User-Generated Content</h2>
      
      {/* Reddit Feed */}
      <RedditUGCFeed 
        dealershipName={dealershipName}
        location={location}
        limit={20}
      />
      
      {/* Other UGC sources (Google Reviews, Yelp, etc.) */}
    </div>
  );
}
```

## Next Steps

1. ✅ **Install Devvit CLI** - `npm install --save-dev devvit@latest`
2. ✅ **Install API packages** - `npm install @devvit/public-api`
3. ✅ **Create Reddit client** - `lib/reddit/devvit-client.ts`
4. ✅ **Create API endpoint** - `/api/ugc/reddit`
5. ✅ **Create UI component** - `RedditUGCFeed`
6. 🔄 **Integrate into UGC dashboard** - Add to `UgcTab.tsx`
7. 🔄 **Add OAuth for higher rate limits** - Optional enhancement
8. 🔄 **Add sentiment analysis** - Analyze post/comment sentiment

## Files

- `lib/reddit/devvit-client.ts` - Reddit API client
- `app/api/ugc/reddit/route.ts` - API endpoint
- `components/ugc/RedditUGCFeed.tsx` - UI component
- `components/ugc/UgcTab.tsx` - UGC dashboard tab (to be updated)

